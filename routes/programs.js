const express = require("express");
const db = require("../db/database");

const router = express.Router();

const ALLOWED_STATUS = ["upcoming", "active", "completed"];

function validateProgram(body, { partial = false } = {}) {
  const errors = [];
  const required = ["name", "track", "start_date", "end_date", "duration_weeks", "capacity"];

  if (!partial) {
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        errors.push(`"${field}" is required.`);
      }
    }
  }

  if (body.status !== undefined && !ALLOWED_STATUS.includes(body.status)) {
    errors.push(`"status" must be one of: ${ALLOWED_STATUS.join(", ")}.`);
  }
  if (body.duration_weeks !== undefined && Number(body.duration_weeks) <= 0) {
    errors.push(`"duration_weeks" must be a positive number.`);
  }
  if (body.capacity !== undefined && Number(body.capacity) < 0) {
    errors.push(`"capacity" cannot be negative.`);
  }
  if (body.enrolled !== undefined && Number(body.enrolled) < 0) {
    errors.push(`"enrolled" cannot be negative.`);
  }
  if (
    body.start_date && body.end_date &&
    new Date(body.start_date) > new Date(body.end_date)
  ) {
    errors.push(`"start_date" must be before "end_date".`);
  }

  return errors;
}

// GET /api/programs?status=active&track=Web+Development&search=cloud
router.get("/", (req, res) => {
  const { status, track, search } = req.query;
  const programs = db.getAll({ status, track, search });
  res.json({ data: programs, count: programs.length });
});

// GET /api/programs/:id
router.get("/:id", (req, res) => {
  const program = db.getById(req.params.id);
  if (!program) return res.status(404).json({ error: "Program not found." });
  res.json({ data: program });
});

// POST /api/programs
router.post("/", (req, res) => {
  const errors = validateProgram(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const created = db.create(req.body);
  res.status(201).json({ data: created });
});

// PUT /api/programs/:id  (full or partial update)
router.put("/:id", (req, res) => {
  const existing = db.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Program not found." });

  const errors = validateProgram(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ errors });

  const updated = db.update(req.params.id, req.body);
  res.json({ data: updated });
});

// PATCH /api/programs/:id/enroll   body: { delta: 1 } or { delta: -1 }
router.patch("/:id/enroll", (req, res) => {
  const existing = db.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Program not found." });

  const delta = Number(req.body.delta ?? 1);
  const newEnrolled = existing.enrolled + delta;

  if (newEnrolled < 0) return res.status(400).json({ error: "Enrolled count cannot go below 0." });
  if (newEnrolled > existing.capacity) return res.status(400).json({ error: "Enrolled count cannot exceed capacity." });

  const updated = db.update(req.params.id, { enrolled: newEnrolled });
  res.json({ data: updated });
});

// DELETE /api/programs/:id
router.delete("/:id", (req, res) => {
  const existing = db.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Program not found." });

  db.remove(req.params.id);
  res.json({ data: existing, message: "Program deleted." });
});

module.exports = router;
