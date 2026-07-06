import type { DB } from './index.js';

// Ordered migrations. Index N runs when user_version === N, then bumps to N+1.
export const migrations: Array<(db: DB) => void> = [
  // 0001_init — exactly three domain tables (usuarios, bookmarks, busquedas).
  (db) => {
    db.exec(`
      CREATE TABLE usuarios (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE bookmarks (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        notice_uid    TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        note          TEXT,
        created_at    TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, notice_uid)
      );
      CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

      CREATE TABLE busquedas (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre        TEXT NOT NULL,
        criteria_json TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, nombre)
      );
      CREATE INDEX idx_busquedas_user ON busquedas(user_id);
    `);
  },
];
