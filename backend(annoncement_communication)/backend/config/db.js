// SQLite database setup for Dvein Innovations - Internship Academy
// No user accounts / auth - "createdBy" / "postedBy" / "assignedTo" are simple text names.
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- Create Tables ----------
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',     -- Pending / In Progress / Completed
  priority TEXT NOT NULL DEFAULT 'Medium',    -- Low / Medium / High
  dueDate TEXT,
  assignedTo TEXT,
  createdBy TEXT DEFAULT 'Guest',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'All',       -- All / Interns / Admins
  postedBy TEXT DEFAULT 'Guest',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  announcementId INTEGER NOT NULL,
  userName TEXT DEFAULT 'Guest',
  text TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcementId) REFERENCES announcements(id) ON DELETE CASCADE
);
`);

module.exports = db;
