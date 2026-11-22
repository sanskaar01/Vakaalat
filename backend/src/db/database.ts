import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH || './data/vakaalat.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('client', 'lawyer', 'admin')),
      real_name TEXT NOT NULL,
      stage_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      has_subscription INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lawyer_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      bio_text TEXT NOT NULL,
      input_mode TEXT NOT NULL CHECK (input_mode IN ('typed', 'voice')) DEFAULT 'typed',
      college TEXT NOT NULL,
      experience_years INTEGER NOT NULL DEFAULT 1,
      domains TEXT NOT NULL, -- JSON array of legal domains
      city TEXT NOT NULL DEFAULT 'Kanpur',
      video_cv_url TEXT,
      verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'verified',
      profile_views INTEGER NOT NULL DEFAULT 0,
      total_likes INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      raw_content TEXT NOT NULL,
      masked_content TEXT NOT NULL,
      celebrity_alias_map TEXT NOT NULL DEFAULT '{}', -- JSON object
      sensitive_amounts TEXT NOT NULL DEFAULT '[]',   -- JSON array of masked spans
      upvotes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      likes_count INTEGER NOT NULL DEFAULT 0,
      importance_score REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comment_likes (
      comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (comment_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS profile_visit_logs (
      id TEXT PRIMARY KEY,
      lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      visitor_stage_name TEXT NOT NULL,
      visitor_domain_interest TEXT NOT NULL,
      seconds_spent INTEGER NOT NULL DEFAULT 45,
      visited_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jolly_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      user_query TEXT NOT NULL,
      detected_category TEXT NOT NULL,
      jolly_reply TEXT NOT NULL,
      first_aid_steps TEXT NOT NULL, -- JSON array
      gov_portals TEXT NOT NULL,     -- JSON array
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscription_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_name TEXT NOT NULL,
      amount_inr INTEGER NOT NULL,
      razorpay_demo_order_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('created', 'paid')) DEFAULT 'created',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id TEXT PRIMARY KEY,
      email TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);

  // Safe migration for phone column on existing SQLite DBs
  const cols = db.prepare(`PRAGMA table_info(users)`).all() as { name: string }[];
  if (!cols.some((c) => c.name === 'phone')) {
    db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
  }

  // Safe migration for full 4-pillar history & token-saving cache on jolly_sessions
  const jollyCols = db.prepare(`PRAGMA table_info(jolly_sessions)`).all() as { name: string }[];
  if (!jollyCols.some((c) => c.name === 'full_response_json')) {
    db.exec(`ALTER TABLE jolly_sessions ADD COLUMN full_response_json TEXT`);
  }
  if (!jollyCols.some((c) => c.name === 'prompt_fingerprint')) {
    db.exec(`ALTER TABLE jolly_sessions ADD COLUMN prompt_fingerprint TEXT`);
  }
}
