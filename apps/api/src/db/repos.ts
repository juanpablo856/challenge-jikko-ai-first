import type { DB } from './index.js';
import type { TenderSummary, TenderFilters } from '@portal/contracts';

// Thin data-access layer. SQLite is synchronous via better-sqlite3.

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export function usersRepo(db: DB) {
  return {
    create(email: string, passwordHash: string): UserRow {
      const info = db
        .prepare('INSERT INTO usuarios (email, password_hash) VALUES (?, ?)')
        .run(email, passwordHash);
      return this.byId(Number(info.lastInsertRowid))!;
    },
    byEmail(email: string): UserRow | undefined {
      return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email) as UserRow | undefined;
    },
    byId(id: number): UserRow | undefined {
      return db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id) as UserRow | undefined;
    },
  };
}

export interface BookmarkRow {
  id: number;
  user_id: number;
  notice_uid: string;
  snapshot_json: string;
  note: string | null;
  created_at: string;
}

export function bookmarksRepo(db: DB) {
  return {
    create(userId: number, noticeUid: string, snapshot: TenderSummary, note?: string): BookmarkRow {
      const info = db
        .prepare(
          'INSERT INTO bookmarks (user_id, notice_uid, snapshot_json, note) VALUES (?, ?, ?, ?)',
        )
        .run(userId, noticeUid, JSON.stringify(snapshot), note ?? null);
      return db
        .prepare('SELECT * FROM bookmarks WHERE id = ?')
        .get(Number(info.lastInsertRowid)) as BookmarkRow;
    },
    listByUser(userId: number): BookmarkRow[] {
      return db
        .prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC, id DESC')
        .all(userId) as BookmarkRow[];
    },
    findByUserAndUid(userId: number, noticeUid: string): BookmarkRow | undefined {
      return db
        .prepare('SELECT * FROM bookmarks WHERE user_id = ? AND notice_uid = ?')
        .get(userId, noticeUid) as BookmarkRow | undefined;
    },
    // Ownership-scoped delete: returns true only if a row belonging to userId was removed.
    deleteOwned(userId: number, id: number): boolean {
      return db.prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?').run(id, userId)
        .changes > 0;
    },
  };
}

export interface SearchRow {
  id: number;
  user_id: number;
  nombre: string;
  criteria_json: string;
  created_at: string;
}

export function searchesRepo(db: DB) {
  return {
    create(userId: number, nombre: string, criteria: TenderFilters): SearchRow {
      const info = db
        .prepare('INSERT INTO busquedas (user_id, nombre, criteria_json) VALUES (?, ?, ?)')
        .run(userId, nombre, JSON.stringify(criteria));
      return db
        .prepare('SELECT * FROM busquedas WHERE id = ?')
        .get(Number(info.lastInsertRowid)) as SearchRow;
    },
    listByUser(userId: number): SearchRow[] {
      return db
        .prepare('SELECT * FROM busquedas WHERE user_id = ? ORDER BY created_at DESC, id DESC')
        .all(userId) as SearchRow[];
    },
    findOwned(userId: number, id: number): SearchRow | undefined {
      return db
        .prepare('SELECT * FROM busquedas WHERE id = ? AND user_id = ?')
        .get(id, userId) as SearchRow | undefined;
    },
    deleteOwned(userId: number, id: number): boolean {
      return db.prepare('DELETE FROM busquedas WHERE id = ? AND user_id = ?').run(id, userId)
        .changes > 0;
    },
  };
}
