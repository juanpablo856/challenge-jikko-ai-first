import type { FastifyInstance } from 'fastify';
import type { Page, TenderDetail, TenderFilters, TenderSummary } from '@portal/contracts';
import { buildApp } from '../src/app.js';
import { openDb } from '../src/db/index.js';
import type { TenderSource } from '../src/tenders/port.js';

// In-memory fake source so tests never touch the network.
export class FakeSource implements TenderSource {
  items: TenderSummary[] = [];
  fail = false;
  searchCalls = 0;

  async search(criteria: TenderFilters): Promise<Page<TenderSummary>> {
    this.searchCalls++;
    if (this.fail) throw new Error('boom');
    const page = criteria.page ?? 1;
    const pageSize = criteria.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const slice = this.items.slice(start, start + pageSize);
    return { items: slice, page, pageSize, hasMore: start + pageSize < this.items.length };
  }
  async getByNoticeUid(uid: string): Promise<TenderDetail | null> {
    if (this.fail) throw new Error('boom');
    const s = this.items.find((i) => i.noticeUid === uid);
    if (!s) return null;
    return { ...s, departamento: null, modalidad: null, descripcion: null, enriquecimiento: null };
  }
}

const config = {
  port: 0,
  databasePath: ':memory:',
  jwtSecret: 'test-secret-at-least-16-chars',
  jwtExpiresIn: '1h',
  sodaDataset: 'test',
};

export async function makeApp(source = new FakeSource()) {
  const app = await buildApp(config, { db: openDb(':memory:'), source, enrichment: null });
  return { app, source };
}

export async function registerAndLogin(
  app: FastifyInstance,
  email = 'user@test.co',
  password = 'password123',
): Promise<string> {
  await app.inject({ method: 'POST', url: '/auth/register', payload: { email, password } });
  const res = await app.inject({ method: 'POST', url: '/auth/login', payload: { email, password } });
  return res.json().accessToken as string;
}

export const auth = (token: string) => ({ authorization: `Bearer ${token}` });
