const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data/code30.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user',
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS owned_courses (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id   TEXT NOT NULL,
    purchased_at INTEGER NOT NULL DEFAULT (unixepoch()),
    price_paid  INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, course_id)
  );

  CREATE TABLE IF NOT EXISTS progress (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id   TEXT NOT NULL,
    day         INTEGER NOT NULL,
    completed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, course_id, day)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement  TEXT NOT NULL,
    unlocked_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, achievement)
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL,
    expires_at  INTEGER NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE INDEX IF NOT EXISTS idx_progress_user_course ON progress(user_id, course_id);
  CREATE INDEX IF NOT EXISTS idx_owned_user ON owned_courses(user_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);
`);

console.log("✅ Database ready at", DB_PATH);

module.exports = db;
