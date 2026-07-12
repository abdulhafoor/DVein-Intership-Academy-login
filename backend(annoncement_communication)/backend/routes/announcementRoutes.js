// Announcement & Communication module routes (no login required)
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// @route  GET /api/announcements  (includes comments)
router.get('/', (req, res) => {
  const announcements = db.prepare('SELECT * FROM announcements ORDER BY createdAt DESC').all();

  const commentStmt = db.prepare(
    'SELECT * FROM comments WHERE announcementId = ? ORDER BY createdAt ASC'
  );

  const result = announcements.map(a => ({
    ...a,
    comments: commentStmt.all(a.id)
  }));

  res.json(result);
});

// @route  POST /api/announcements
router.post('/', (req, res) => {
  const { title, message, audience, postedBy } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  const info = db.prepare(`
    INSERT INTO announcements (title, message, audience, postedBy)
    VALUES (?, ?, ?, ?)
  `).run(title, message, audience || 'All', postedBy || 'Guest');

  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...announcement, comments: [] });
});

// @route  PUT /api/announcements/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Announcement not found' });

  const { title, message, audience, postedBy } = req.body;
  if (title === '' || message === '') {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  db.prepare(`
    UPDATE announcements SET
      title = ?, message = ?, audience = ?, postedBy = ?
    WHERE id = ?
  `).run(
    title ?? existing.title,
    message ?? existing.message,
    audience ?? existing.audience,
    postedBy ?? existing.postedBy,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  const comments = db.prepare('SELECT * FROM comments WHERE announcementId = ? ORDER BY createdAt ASC').all(req.params.id);
  res.json({ ...updated, comments });
});

// @route  DELETE /api/announcements/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Announcement not found' });

  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ message: 'Announcement deleted successfully' });
});

// @route  POST /api/announcements/:id/comments  (communication / discussion)
router.post('/:id/comments', (req, res) => {
  const { text, userName } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text is required' });

  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

  const info = db.prepare(`
    INSERT INTO comments (announcementId, userName, text) VALUES (?, ?, ?)
  `).run(req.params.id, userName || 'Guest', text);

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(comment);
});

// @route  PUT /api/announcements/:id/comments/:commentId  (edit a comment)
router.put('/:id/comments/:commentId', (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ? AND announcementId = ?')
    .get(req.params.commentId, req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const { text, userName } = req.body;
  if (text === '') return res.status(400).json({ message: 'Comment text is required' });

  db.prepare('UPDATE comments SET text = ?, userName = ? WHERE id = ?').run(
    text ?? comment.text,
    userName ?? comment.userName,
    req.params.commentId
  );

  const updated = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.commentId);
  res.json(updated);
});

// @route  DELETE /api/announcements/:id/comments/:commentId
router.delete('/:id/comments/:commentId', (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ? AND announcementId = ?')
    .get(req.params.commentId, req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.commentId);
  res.json({ message: 'Comment deleted successfully' });
});

module.exports = router;
