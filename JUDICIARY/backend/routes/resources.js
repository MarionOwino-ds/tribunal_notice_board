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

// GET /api/resources
// Admin: all resources, optionally filtered by tribunal_id
// Staff: resources for their tribunal + public resources
router.get('/', requireAuth, (req, res) => {
  const { user } = req.session;

  if (user.role === 'admin') {
    const { tribunal_id } = req.query;
    let query = `
      SELECT r.*, t.name AS tribunal_name, u.full_name AS uploaded_by_name
      FROM resources r
      LEFT JOIN tribunals t ON r.tribunal_id = t.id
      LEFT JOIN users u ON r.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    if (tribunal_id) { query += ' AND r.tribunal_id = ?'; params.push(tribunal_id); }
    query += ' ORDER BY r.resource_date DESC';
    return res.json(db.prepare(query).all(...params));
  }

  const resources = db.prepare(`
    SELECT r.*, t.name AS tribunal_name, u.full_name AS uploaded_by_name
    FROM resources r
    LEFT JOIN tribunals t ON r.tribunal_id = t.id
    LEFT JOIN users u ON r.uploaded_by = u.id
    WHERE r.tribunal_id = ? OR r.is_public = 1
    ORDER BY r.resource_date DESC
  `).all(user.tribunal_id);

  res.json(resources);
});

// POST /api/resources — admin only
router.post('/', requireAdmin, (req, res) => {
  const { name, description, file_url, file_size, tribunal_id, is_public = 0, resource_date } = req.body;

  if (!name || !file_url || !resource_date) {
    return res.status(400).json({ error: 'name, file_url and resource_date are required.' });
  }

  const scopedTribunal = is_public ? null : (tribunal_id || req.session.user.tribunal_id);

  const result = db.prepare(`
    INSERT INTO resources (name, description, file_url, file_size, tribunal_id, is_public, uploaded_by, resource_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description || null, file_url, file_size || null, scopedTribunal, is_public ? 1 : 0, req.session.user.id, resource_date);

  res.status(201).json({ message: 'Resource added.', id: result.lastInsertRowid });
});

// DELETE /api/resources/:id — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const resource = db.prepare('SELECT id FROM resources WHERE id = ?').get(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found.' });

  db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
  res.json({ message: 'Resource deleted.' });
});

module.exports = router;
