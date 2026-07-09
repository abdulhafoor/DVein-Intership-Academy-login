// db.js
// Sets up the SQLite database for the Batch Management and Resource Library
// modules only. No users/auth table here — that's handled by the login module.

const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "dvein_academy.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS batches (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  track        TEXT,
  mentor       TEXT,
  start_date   TEXT NOT NULL,
  end_date     TEXT NOT NULL,
  capacity     INTEGER NOT NULL DEFAULT 20,
  enrolled     INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resources (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL DEFAULT 'General',
  type         TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link','pdf','video','doc','slide')),
  url          TEXT,
  file_path    TEXT,
  file_name    TEXT,
  file_size    INTEGER,
  batch_id     INTEGER,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);
`);

// ---------- Lightweight migration ----------
// If someone already has an older resources table (from before file uploads
// were supported), add the new columns instead of requiring a fresh database.
const resourceColumns = db.prepare("PRAGMA table_info(resources)").all().map((c) => c.name);
if (!resourceColumns.includes("file_path")) {
  db.exec("ALTER TABLE resources ADD COLUMN file_path TEXT");
}
if (!resourceColumns.includes("file_name")) {
  db.exec("ALTER TABLE resources ADD COLUMN file_name TEXT");
}
if (!resourceColumns.includes("file_size")) {
  db.exec("ALTER TABLE resources ADD COLUMN file_size INTEGER");
}

// ---------- Seed sample data on first run only ----------
const batchCount = db.prepare("SELECT COUNT(*) AS c FROM batches").get().c;
if (batchCount === 0) {
  const insertBatch = db.prepare(`
    INSERT INTO batches (code, name, track, mentor, start_date, end_date, capacity, enrolled, status)
    VALUES (@code, @name, @track, @mentor, @start_date, @end_date, @capacity, @enrolled, @status)
  `);
  insertBatch.run({ code: "IA-2026-01", name: "Full Stack Web Development", track: "Web", mentor: "Priya Nair", start_date: "2026-06-01", end_date: "2026-08-24", capacity: 25, enrolled: 18, status: "ongoing" });
  insertBatch.run({ code: "IA-2026-02", name: "Data Analytics Fundamentals", track: "Data", mentor: "Rohan Mehta", start_date: "2026-07-15", end_date: "2026-10-07", capacity: 20, enrolled: 9, status: "upcoming" });

  const insertResource = db.prepare(`
    INSERT INTO resources (title, description, category, type, url, batch_id)
    VALUES (@title, @description, @category, @type, @url, @batch_id)
  `);
  insertResource.run({ title: "Git & GitHub Crash Course", description: "Version control basics every intern needs before week one.", category: "Onboarding", type: "video", url: "https://example.com/git-crash-course", batch_id: 1 });
  insertResource.run({ title: "REST API Design Guidelines", description: "House style for naming routes, status codes and error shapes.", category: "Engineering", type: "doc", url: "https://example.com/rest-guidelines", batch_id: 1 });
  insertResource.run({ title: "SQL Joins Cheat Sheet", description: "Quick visual reference for inner/left/right/full joins.", category: "Data", type: "pdf", url: "https://example.com/sql-joins.pdf", batch_id: 2 });
}

module.exports = db;
