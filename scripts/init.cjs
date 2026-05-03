'use strict';

const Database = require('better-sqlite3');
const argon2 = require('argon2');
const path = require('path');
const fs = require('fs');

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'portfolio.db');
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      ip TEXT,
      user_agent TEXT
    );
    CREATE TABLE IF NOT EXISTS oidc_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'oidc',
      issuer_url TEXT NOT NULL,
      client_id TEXT NOT NULL,
      client_secret TEXT NOT NULL,
      redirect_uri TEXT,
      allowed_email TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );
  `);

  console.log('[init] Tables ensured.');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
    if (!existingUser) {
      console.log('[init] Seeding admin user...');
      const passwordHash = await argon2.hash(adminPassword);
      db.prepare(
        'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)'
      ).run(adminEmail, passwordHash, Date.now());
      console.log(`[init] Admin user created: ${adminEmail}`);
    } else {
      console.log('[init] Users already exist, skipping seed.');
    }
  } else {
    console.log('[init] ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping seed.');
  }

  db.close();
  console.log('[init] Done.');
}

main().catch((err) => {
  console.error('[init] Error:', err);
  process.exit(1);
});
