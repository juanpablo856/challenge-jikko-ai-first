import type { FastifyInstance } from 'fastify';
import type { SavedSearch, TenderFilters } from '@portal/contracts';
import type { AppDeps } from '../context.js';
import { conflict, notFound } from '../errors.js';
import { normalizeFilters } from '../tenders/filters.js';
import type { SearchRow } from '../db/repos.js';

const createSchema = {
  body: {
    type: 'object',
    required: ['nombre', 'criteria'],
    additionalProperties: false,
    properties: {
      nombre: { type: 'string', minLength: 1, maxLength: 120 },
      criteria: { type: 'object' },
    },
  },
};

function toSearch(row: SearchRow): SavedSearch {
  return {
    id: row.id,
    nombre: row.nombre,
    criteria: JSON.parse(row.criteria_json) as TenderFilters,
    created_at: row.created_at,
  };
}

export async function searchRoutes(app: FastifyInstance, deps: AppDeps): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.post<{ Body: { nombre: string; criteria: Record<string, unknown> } }>(
    '/searches',
    { schema: createSchema },
    async (req, reply) => {
      const userId = req.user.id;
      // Validate criteria through the SAME normalized model as GET /tenders so saved
      // searches stay valid even if the source translation changes internally (spec 6.5).
      const criteria = normalizeFilters(req.body.criteria);
      if (deps.searches.listByUser(userId).some((s) => s.nombre === req.body.nombre)) {
        throw conflict('ya existe una búsqueda con ese nombre');
      }
      const row = deps.searches.create(userId, req.body.nombre, criteria);
      return reply.status(201).send(toSearch(row));
    },
  );

  app.get('/searches', async (req) => {
    return deps.searches.listByUser(req.user.id).map(toSearch);
  });

  app.get<{ Params: { id: string } }>('/searches/:id/results', async (req) => {
    const row = deps.searches.findOwned(req.user.id, Number(req.params.id));
    if (!row) throw notFound('búsqueda no encontrada');
    // Re-normalize the stored criteria before executing — stable contract across source changes.
    const criteria = normalizeFilters(JSON.parse(row.criteria_json));
    return deps.tenders.search(criteria);
  });

  app.delete<{ Params: { id: string } }>('/searches/:id', async (req, reply) => {
    const ok = deps.searches.deleteOwned(req.user.id, Number(req.params.id));
    if (!ok) throw notFound('búsqueda no encontrada');
    return reply.status(204).send();
  });
}
