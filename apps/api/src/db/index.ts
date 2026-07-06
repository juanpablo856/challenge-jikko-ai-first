import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { migrations } from './migrations.js';

export type DB = Database.Database;

// Open the SQLite database and run any pending migrations.
// Versioned via user_version pragma — no migrations table needed (ponytail: simplest
// scheme that works for a single-writer MVP; add a history table if you need rollbacks).
export function openDb(path: string): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

function runMigrations(db: DB): void {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (let v = current; v < migrations.length; v++) {
    const migrate = migrations[v];
    const tx = db.transaction(() => {
      migrate(db);
      db.pragma(`user_version = ${v + 1}`);
    });
    tx();
  }
}
