import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { Config } from './config.js';
import { openDb, type DB } from './db/index.js';
import { bookmarksRepo, searchesRepo, usersRepo } from './db/repos.js';
import { authPlugin } from './auth/plugin.js';
import { authRoutes } from './auth/routes.js';
import { registerErrorHandler } from './errors.js';
import type { AppDeps } from './context.js';
import { SodaTenderSource } from './tenders/soda.js';
import { CromaEnrichmentSource } from './tenders/croma.js';
import { TenderService } from './tenders/service.js';
import type { TenderEnrichment, TenderSource } from './tenders/port.js';
import { tenderRoutes } from './tenders/routes.js';
import { bookmarkRoutes } from './bookmarks/routes.js';
import { searchRoutes } from './searches/routes.js';

export interface BuildOverrides {
  db?: DB;
  source?: TenderSource;
  enrichment?: TenderEnrichment | null;
}

// Constructs a fully-wired Fastify app. Tests inject an in-memory db and fake source.
export async function buildApp(config: Config, overrides: BuildOverrides = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(helmet);
  await app.register(cors, { origin: true });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  // OpenAPI generated from route schemas; UI at /docs (task 8.4).
  await app.register(swagger, {
    openapi: { info: { title: 'Portal de Convocatorias API', version: '0.1.0' } },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });
  await app.register(authPlugin, { secret: config.jwtSecret, expiresIn: config.jwtExpiresIn });
  registerErrorHandler(app);

  const db = overrides.db ?? openDb(config.databasePath);
  const source =
    overrides.source ??
    new SodaTenderSource({ dataset: config.sodaDataset, appToken: config.sodaAppToken });
  const enrichment =
    overrides.enrichment !== undefined
      ? overrides.enrichment ?? undefined
      : config.cromaApiKey
        ? new CromaEnrichmentSource({ apiKey: config.cromaApiKey })
        : undefined;

  const deps: AppDeps = {
    users: usersRepo(db),
    bookmarks: bookmarksRepo(db),
    searches: searchesRepo(db),
    tenders: new TenderService(source, enrichment),
  };

  await app.register(async (instance) => authRoutes(instance, deps));
  await app.register(async (instance) => tenderRoutes(instance, deps));
  await app.register(async (instance) => bookmarkRoutes(instance, deps));
  await app.register(async (instance) => searchRoutes(instance, deps));

  app.get('/health', async () => ({ status: 'ok' }));
  return app;
}
