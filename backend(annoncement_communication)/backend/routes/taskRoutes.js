// Technical Management module - task/issue tracking routes (no login required)
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// @route  GET /api/tasks
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
  res.json(rows);
});

// @route  GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Task not found' });
  res.json(row);
});

// @route  POST /api/tasks
router.post('/', (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, createdBy } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const info = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, dueDate, assignedTo, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || '',
    status || 'Pending',
    priority || 'Medium',
    dueDate || null,
    assignedTo || '',
    createdBy || 'Guest'
  );

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(task);
});

// @route  PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Task not found' });

  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, status = ?, priority = ?, dueDate = ?, assignedTo = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title ?? existing.title,
    description ?? existing.description,
    status ?? existing.status,
    priority ?? existing.priority,
    dueDate ?? existing.dueDate,
    assignedTo ?? existing.assignedTo,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// @route  DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Task not found' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted successfully' });
});

module.exports = router;
