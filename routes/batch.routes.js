// routes/batch.routes.js
// Batch Management module: create, read, update, delete internship batches.
// No auth middleware here — plug in the login team's middleware later if needed
// by adding it to server.js (e.g. app.use('/api/batches', requireAuth, batchRoutes)).

const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/batches?status=&search=
router.get("/", (req, res) => {
  const { status, search } = req.query;
  let sql = "SELECT * FROM batches WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (search) {
    sql += " AND (name LIKE ? OR code LIKE ? OR track LIKE ? OR mentor LIKE ?)";
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  sql += " ORDER BY start_date DESC";

  const batches = db.prepare(sql).all(...params);
  res.json({ batches });
});

// GET /api/batches/:id
router.get("/:id", (req, res) => {
  const batch = db.prepare("SELECT * FROM batches WHERE id = ?").get(req.params.id);
  if (!batch) return res.status(404).json({ message: "Batch not found." });

  const resources = db.prepare("SELECT * FROM resources WHERE batch_id = ? ORDER BY created_at DESC").all(req.params.id);
  res.json({ batch, resources });
});

// POST /api/batches
router.post("/", (req, res) => {
  const { code, name, track, mentor, start_date, end_date, capacity, enrolled, status } = req.body;

  if (!code || !name || !start_date || !end_date) {
    return res.status(400).json({ message: "code, name, start_date and end_date are required." });
  }

  const existing = db.prepare("SELECT id FROM batches WHERE code = ?").get(code);
  if (existing) {
    return res.status(409).json({ message: "A batch with this code already exists." });
  }

  const info = db
    .prepare(`INSERT INTO batches (code, name, track, mentor, start_date, end_date, capacity, enrolled, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      code,
      name,
      track || null,
      mentor || null,
      start_date,
      end_date,
      Number(capacity) || 20,
      Number(enrolled) || 0,
      status || "upcoming"
    );

  const batch = db.prepare("SELECT * FROM batches WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ message: "Batch created successfully.", batch });
});

// PUT /api/batches/:id
router.put("/:id", (req, res) => {
  const batch = db.prepare("SELECT * FROM batches WHERE id = ?").get(req.params.id);
  if (!batch) return res.status(404).json({ message: "Batch not found." });

  const fields = ["code", "name", "track", "mentor", "start_date", "end_date", "capacity", "enrolled", "status"];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const setClause = Object.keys(updates).map((k) => `${k} = @${k}`).join(", ");
  if (!setClause) return res.status(400).json({ message: "No valid fields provided to update." });

  db.prepare(`UPDATE batches SET ${setClause} WHERE id = @id`).run({ ...updates, id: req.params.id });

  const updated = db.prepare("SELECT * FROM batches WHERE id = ?").get(req.params.id);
  res.json({ message: "Batch updated successfully.", batch: updated });
});

// DELETE /api/batches/:id
router.delete("/:id", (req, res) => {
  const batch = db.prepare("SELECT * FROM batches WHERE id = ?").get(req.params.id);
  if (!batch) return res.status(404).json({ message: "Batch not found." });

  db.prepare("UPDATE resources SET batch_id = NULL WHERE batch_id = ?").run(req.params.id);
  db.prepare("DELETE FROM batches WHERE id = ?").run(req.params.id);

  res.json({ message: "Batch deleted successfully." });
});

module.exports = router;
