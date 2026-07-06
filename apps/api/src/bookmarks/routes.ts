import type { FastifyInstance } from 'fastify';
import type { Bookmark, TenderSummary } from '@portal/contracts';
import type { AppDeps } from '../context.js';
import { conflict, notFound } from '../errors.js';
import type { BookmarkRow } from '../db/repos.js';

const createSchema = {
  body: {
    type: 'object',
    required: ['noticeUid'],
    additionalProperties: false,
    properties: {
      noticeUid: { type: 'string', minLength: 1, maxLength: 200 },
      note: { type: 'string', maxLength: 1000 },
    },
  },
};

function toBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    noticeUid: row.notice_uid,
    snapshot: JSON.parse(row.snapshot_json) as TenderSummary,
    note: row.note,
    created_at: row.created_at,
  };
}

export async function bookmarkRoutes(app: FastifyInstance, deps: AppDeps): Promise<void> {
  app.addHook('preHandler', app.authenticate); // all bookmark routes protected

  app.post<{ Body: { noticeUid: string; note?: string } }>(
    '/bookmarks',
    { schema: createSchema },
    async (req, reply) => {
      const userId = req.user.id;
      const { noticeUid, note } = req.body;
      if (deps.bookmarks.findByUserAndUid(userId, noticeUid)) {
        throw conflict('la convocatoria ya está guardada');
      }
      // Snapshot from source for resilience (D6). No snapshot => nothing to save.
      const snapshot = await deps.tenders.getSummary(noticeUid);
      if (!snapshot) throw notFound('convocatoria no encontrada en la fuente');
      const row = deps.bookmarks.create(userId, noticeUid, snapshot, note);
      return reply.status(201).send(toBookmark(row));
    },
  );

  app.get('/bookmarks', async (req) => {
    // Returns stored snapshots — essential info survives even if the source drops the
    // record (spec 5.4). Live availability is resolved on the detail view, not per-list.
    return deps.bookmarks.listByUser(req.user.id).map(toBookmark);
  });

  app.delete<{ Params: { id: string } }>('/bookmarks/:id', async (req, reply) => {
    const ok = deps.bookmarks.deleteOwned(req.user.id, Number(req.params.id));
    if (!ok) throw notFound('bookmark no encontrado');
    return reply.status(204).send();
  });
}
