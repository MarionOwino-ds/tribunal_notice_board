const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db');

const router = express.Router();

const VALID_DEPARTMENTS = [
  'Registry', 'Court Coordination', 'Legal Support', 'Human Resources',
  'IT Services', 'Finance', 'Public Relations', 'Records Management'
];

// GET /api/auth/tribunals — public, used to populate the register form dropdown
router.get('/tribunals', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, color_hex FROM tribunals ORDER BY id').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch tribunals.' });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { full_name, user_id, email, department, tribunal_id, password } = req.body;

  if (!full_name || !user_id || !email || !department || !tribunal_id || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  if (!VALID_DEPARTMENTS.includes(department)) {
    return res.status(400).json({ error: 'Invalid department.' });
  }

  const tribunal = db.prepare('SELECT id FROM tribunals WHERE id = ?').get(tribunal_id);
  if (!tribunal) return res.status(400).json({ error: 'Invalid tribunal.' });

  const existing = db.prepare('SELECT id FROM users WHERE user_id = ? OR email = ?').get(user_id, email);
  if (existing) return res.status(409).json({ error: 'Staff ID or email already registered.' });

  const password_hash = bcrypt.hashSync(password, 12);

  const result = db.prepare(`
    INSERT INTO users (user_id, password_hash, full_name, email, role, tribunal_id, department)
    VALUES (?, ?, ?, ?, 'staff', ?, ?)
  `).run(user_id, password_hash, full_name, email, tribunal_id, department);

  res.status(201).json({ message: 'Account created successfully.', id: result.lastInsertRowid });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ error: 'Staff ID and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(user_id);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid staff ID or password.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Your account has been deactivated. Contact the IT Desk.' });
  }

  // Update last_login_at
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

  // Store safe user info in session
  req.session.user = {
    id:              user.id,
    user_id:         user.user_id,
    full_name:       user.full_name,
    email:           user.email,
    role:            user.role,
    tribunal_id:     user.tribunal_id,
    department:      user.department,
    profile_picture: user.profile_picture
  };

  res.json({ message: 'Login successful.', user: req.session.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

// GET /api/auth/me — returns current session user
router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated.' });
  
  // Always fetch latest to ensure profile pic and email are up-to-date
  const user = db.prepare('SELECT id, user_id, full_name, email, role, tribunal_id, department, profile_picture FROM users WHERE id = ?').get(req.session.user.id);
  if (!user) return res.status(401).json({ error: 'User no longer exists.' });
  
  // Update session
  req.session.user = user;
  res.json(user);
});

module.exports = router;
