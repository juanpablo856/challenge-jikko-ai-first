import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../context.js';
import { notFound } from '../errors.js';
import { normalizeFilters } from './filters.js';

// All tender routes require auth (spec: domain routes protected).
export async function tenderRoutes(app: FastifyInstance, deps: AppDeps): Promise<void> {
  app.get('/tenders', { preHandler: app.authenticate }, async (req) => {
    const criteria = normalizeFilters((req.query ?? {}) as Record<string, unknown>);
    return deps.tenders.search(criteria);
  });

  app.get<{ Params: { noticeUid: string } }>(
    '/tenders/:noticeUid',
    { preHandler: app.authenticate },
    async (req) => {
      const detail = await deps.tenders.getDetail(req.params.noticeUid);
      if (!detail) throw notFound('convocatoria no encontrada');
      return detail;
    },
  );
}
