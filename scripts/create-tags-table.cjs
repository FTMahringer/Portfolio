const Database = require('better-sqlite3');
const db = new Database('./data/portfolio.db');
try {
  db.exec(`CREATE TABLE IF NOT EXISTS "tags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" text NOT NULL, "slug" text NOT NULL, "color_index" integer DEFAULT 0 NOT NULL, "usage_count" integer DEFAULT 0 NOT NULL, "created_at" integer NOT NULL)`);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS tags_name_unique ON tags (name)');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS tags_slug_unique ON tags (slug)');
  console.log('tags table created OK');
} catch(e) {
  console.error('Error:', e.message);
}
db.close();
