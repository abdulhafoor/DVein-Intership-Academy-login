// routes/resource.routes.js
// Resource Library module: create, read, update, delete learning resources.
// Supports two ways to add a resource:
//   - type "link"                → a URL is required, no file involved.
//   - type pdf/video/doc/slide   → an uploaded file is the primary content;
//                                   an external URL is optional alongside it.
// No auth middleware here — plug in the login team's middleware later if needed.

const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("../db");

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ---------- Multer setup (disk storage, sanitised filenames) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB per file
});

// Deletes a file from the uploads folder, ignoring errors if it's already gone.
function deleteUploadedFile(fileName) {
  if (!fileName) return;
  fs.unlink(path.join(UPLOADS_DIR, fileName), () => {});
}

// Adds a browsable file_url to a resource row without mutating the original.
function serializeResource(row) {
  return {
    ...row,
    file_url: row.file_path ? `/uploads/${row.file_path}` : null,
  };
}

// Normalises an empty string to null so "no link provided" is stored consistently.
function emptyToNull(value) {
  if (value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length === 0 ? null : trimmed;
}

// GET /api/resources?category=&type=&batch_id=&search=
router.get("/", (req, res) => {
  const { category, type, batch_id, search } = req.query;
  let sql = `
    SELECT r.*, b.name AS batch_name, b.code AS batch_code
    FROM resources r
    LEFT JOIN batches b ON b.id = r.batch_id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += " AND r.category = ?";
    params.push(category);
  }
  if (type) {
    sql += " AND r.type = ?";
    params.push(type);
  }
  if (batch_id) {
    sql += " AND r.batch_id = ?";
    params.push(batch_id);
  }
  if (search) {
    sql += " AND (r.title LIKE ? OR r.description LIKE ?)";
    const like = `%${search}%`;
    params.push(like, like);
  }
  sql += " ORDER BY r.created_at DESC";

  const resources = db.prepare(sql).all(...params);
  res.json({ resources: resources.map(serializeResource) });
});

// GET /api/resources/meta/categories  (must be declared before /:id)
router.get("/meta/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM resources ORDER BY category").all();
  res.json({ categories: rows.map((r) => r.category) });
});

// GET /api/resources/:id
router.get("/:id", (req, res) => {
  const resource = db
    .prepare(`SELECT r.*, b.name AS batch_name, b.code AS batch_code
              FROM resources r LEFT JOIN batches b ON b.id = r.batch_id
              WHERE r.id = ?`)
    .get(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found." });
  res.json({ resource: serializeResource(resource) });
});

// POST /api/resources — multipart/form-data, "file" field optional depending on type
router.post("/", upload.single("file"), (req, res) => {
  try {
    const { title, description, category, batch_id } = req.body;
    const type = req.body.type || "link";
    const url = emptyToNull(req.body.url);

    if (!title) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({ message: "title is required." });
    }

    if (type === "link") {
      // Link-type resources never keep an uploaded file, even if one was sent.
      if (req.file) deleteUploadedFile(req.file.filename);
      if (!url) {
        return res.status(400).json({ message: "A URL is required for link resources." });
      }
    } else if (!req.file && !url) {
      return res.status(400).json({ message: "Upload a file or provide a link for this resource." });
    }

    const info = db
      .prepare(`INSERT INTO resources (title, description, category, type, url, file_path, file_name, file_size, batch_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        title,
        description || null,
        category || "General",
        type,
        url,
        type === "link" ? null : req.file ? req.file.filename : null,
        type === "link" ? null : req.file ? req.file.originalname : null,
        type === "link" ? null : req.file ? req.file.size : null,
        batch_id || null
      );

    const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ message: "Resource added successfully.", resource: serializeResource(resource) });
  } catch (err) {
    if (req.file) deleteUploadedFile(req.file.filename);
    res.status(400).json({ message: err.message || "Could not create resource." });
  }
});

// PUT /api/resources/:id — multipart/form-data, "file" optional (replaces existing)
router.put("/:id", upload.single("file"), (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id);
    if (!existing) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(404).json({ message: "Resource not found." });
    }

    const type = req.body.type !== undefined ? req.body.type : existing.type;
    const url = req.body.url !== undefined ? emptyToNull(req.body.url) : existing.url;
    const removeFile = req.body.remove_file === "true";

    const updates = {
      title: req.body.title !== undefined ? req.body.title : existing.title,
      description: req.body.description !== undefined ? req.body.description : existing.description,
      category: req.body.category !== undefined ? req.body.category : existing.category,
      batch_id: req.body.batch_id !== undefined ? (req.body.batch_id || null) : existing.batch_id,
      type,
      url,
      file_path: existing.file_path,
      file_name: existing.file_name,
      file_size: existing.file_size,
    };

    if (type === "link") {
      // Switching to (or staying on) link type drops any existing file.
      if (existing.file_path) deleteUploadedFile(existing.file_path);
      if (req.file) deleteUploadedFile(req.file.filename); // shouldn't normally arrive, but just in case
      updates.file_path = null;
      updates.file_name = null;
      updates.file_size = null;
      if (!updates.url) {
        return res.status(400).json({ message: "A URL is required for link resources." });
      }
    } else if (req.file) {
      // A new file was uploaded — replace the old one.
      if (existing.file_path) deleteUploadedFile(existing.file_path);
      updates.file_path = req.file.filename;
      updates.file_name = req.file.originalname;
      updates.file_size = req.file.size;
    } else if (removeFile) {
      // User explicitly cleared the file without uploading a replacement.
      if (existing.file_path) deleteUploadedFile(existing.file_path);
      updates.file_path = null;
      updates.file_name = null;
      updates.file_size = null;
    }

    if (type !== "link" && !updates.file_path && !updates.url) {
      return res.status(400).json({ message: "Upload a file or provide a link for this resource." });
    }

    db.prepare(`
      UPDATE resources SET
        title = @title, description = @description, category = @category,
        batch_id = @batch_id, type = @type, url = @url,
        file_path = @file_path, file_name = @file_name, file_size = @file_size
      WHERE id = @id
    `).run({ ...updates, id: req.params.id });

    const updated = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id);
    res.json({ message: "Resource updated successfully.", resource: serializeResource(updated) });
  } catch (err) {
    if (req.file) deleteUploadedFile(req.file.filename);
    res.status(400).json({ message: err.message || "Could not update resource." });
  }
});

// DELETE /api/resources/:id
router.delete("/:id", (req, res) => {
  const resource = db.prepare("SELECT * FROM resources WHERE id = ?").get(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found." });

  if (resource.file_path) deleteUploadedFile(resource.file_path);
  db.prepare("DELETE FROM resources WHERE id = ?").run(req.params.id);
  res.json({ message: "Resource deleted successfully." });
});

module.exports = router;
