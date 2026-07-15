const express = require('express');
const { db } = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// Generate next ref number: INT/NTC/YYYY/NNN
function generateRef() {
  const year = new Date().getFullYear();
  const last = db.prepare(
    "SELECT ref FROM notices WHERE ref LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(`INT/NTC/${year}/%`);

  let seq = 1;
  if (last) {
    const parts = last.ref.split('/');
    seq = parseInt(parts[3], 10) + 1;
  }
  return `INT/NTC/${year}/${String(seq).padStart(3, '0')}`;
}

// GET /api/notices
// Admin: can filter by tribunal_id query param, sees all statuses
// Staff: sees approved notices for their tribunal + public notices
router.get('/', requireAuth, (req, res) => {
  const { user } = req.session;

  if (user.role === 'admin') {
    const { tribunal_id, status } = req.query;
    let query = `
      SELECT n.*, u.full_name AS posted_by_name, s.full_name AS submitted_by_name,
             t.name AS tribunal_name
      FROM notices n
      LEFT JOIN users u ON n.posted_by = u.id
      LEFT JOIN users s ON n.submitted_by = s.id
      LEFT JOIN tribunals t ON n.tribunal_id = t.id
      WHERE 1=1
    `;
    const params = [];
    if (tribunal_id) { query += ' AND n.tribunal_id = ?'; params.push(tribunal_id); }
    if (status)      { query += ' AND n.status = ?';      params.push(status); }
    query += ' ORDER BY n.is_urgent DESC, n.notice_date DESC';
    return res.json(db.prepare(query).all(...params));
  }

  // Staff: approved notices for their tribunal OR public
  const notices = db.prepare(`
    SELECT n.*, u.full_name AS posted_by_name, t.name AS tribunal_name
    FROM notices n
    LEFT JOIN users u ON n.posted_by = u.id
    LEFT JOIN tribunals t ON n.tribunal_id = t.id
    WHERE n.status = 'approved'
      AND (n.tribunal_id = ? OR n.is_public = 1)
    ORDER BY n.is_urgent DESC, n.notice_date DESC
  `).all(user.tribunal_id);

  res.json(notices);
});

// GET /api/notices/my-submissions — staff sees their own memo submissions
router.get('/my-submissions', requireAuth, (req, res) => {
  const submissions = db.prepare(`
    SELECT n.*, t.name AS tribunal_name
    FROM notices n
    LEFT JOIN tribunals t ON n.tribunal_id = t.id
    WHERE n.submitted_by = ?
    ORDER BY n.created_at DESC
  `).all(req.session.user.id);

  res.json(submissions);
});

// POST /api/notices
// Admin: posts a notice (status = approved immediately)
// Staff: submits a memo (status = pending)
router.post('/', requireAuth, (req, res) => {
  const { user } = req.session;
  const { title, body, notice_date, is_urgent = 0, is_public = 0, tribunal_id } = req.body;

  if (!title || !body || !notice_date) {
    return res.status(400).json({ error: 'title, body and notice_date are required.' });
  }

  const ref = generateRef();
  const scopedTribunal = is_public ? null : (tribunal_id || user.tribunal_id);
  const status = user.role === 'admin' ? 'approved' : 'pending';
  const posted_by = user.role === 'admin' ? user.id : null;
  const submitted_by = user.role === 'staff' ? user.id : null;

  const result = db.prepare(`
    INSERT INTO notices (ref, tribunal_id, is_public, title, body, notice_date, is_urgent, status, posted_by, submitted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(ref, scopedTribunal, is_public ? 1 : 0, title, body, notice_date, is_urgent ? 1 : 0, status, posted_by, submitted_by);

  // Notify all users in the tribunal (or all users if public) when admin posts
  if (user.role === 'admin') {
    const targets = is_public
      ? db.prepare('SELECT id FROM users WHERE is_active = 1').all()
      : db.prepare('SELECT id FROM users WHERE tribunal_id = ? AND is_active = 1').all(scopedTribunal);

    const insertNotif = db.prepare(`
      INSERT INTO notifications (user_id, title, meta, notice_ref)
      VALUES (?, ?, ?, ?)
    `);
    const notifyMany = db.transaction((users) => {
      for (const u of users) {
        insertNotif.run(u.id, title, notice_date, ref);
      }
    });
    notifyMany(targets);
  }

  res.status(201).json({ message: 'Notice created.', ref, id: result.lastInsertRowid });
});

// PATCH /api/notices/:id/status — admin approves or rejects a memo
router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status, reject_reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved or rejected.' });
  }

  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);
  if (!notice) return res.status(404).json({ error: 'Notice not found.' });
  if (notice.status !== 'pending') return res.status(409).json({ error: 'Notice is not pending.' });

  db.prepare(`
    UPDATE notices SET status = ?, reject_reason = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, reject_reason || null, req.params.id);

  // Notify the submitter
  if (notice.submitted_by) {
    const notifTitle = status === 'approved'
      ? `✓ Your memo was approved`
      : `✗ Your memo was rejected`;
    db.prepare(`
      INSERT INTO notifications (user_id, title, meta, notice_ref)
      VALUES (?, ?, ?, ?)
    `).run(notice.submitted_by, notifTitle, reject_reason || null, notice.ref);
  }

  res.json({ message: `Notice ${status}.` });
});

// DELETE /api/notices/:id — staff withdraws their own pending memo
router.delete('/:id', requireAuth, (req, res) => {
  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(req.params.id);

  if (!notice) return res.status(404).json({ error: 'Notice not found.' });
  if (notice.submitted_by !== req.session.user.id) {
    return res.status(403).json({ error: 'You can only withdraw your own submissions.' });
  }
  if (notice.status !== 'pending') {
    return res.status(409).json({ error: 'Only pending memos can be withdrawn.' });
  }

  db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
  res.json({ message: 'Memo withdrawn.' });
});

module.exports = router;
