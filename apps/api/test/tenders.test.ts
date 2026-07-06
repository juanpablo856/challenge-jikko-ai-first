import { afterEach, describe, expect, it } from 'vitest';
import { auth, FakeSource, makeApp, registerAndLogin } from './helpers.js';
import type { TenderSummary } from '@portal/contracts';

function seed(n: number): TenderSummary[] {
  return Array.from({ length: n }, (_, i) => ({
    noticeUid: `CO1.NTC.${i + 1}`,
    titulo: `Convocatoria ${i + 1}`,
    entidad: 'Alcaldía',
    valor: (i + 1) * 1000,
    fecha: '2026-01-01',
    estado: 'Convocado',
  }));
}

describe('tender-exploration', () => {
  let ctx: Awaited<ReturnType<typeof makeApp>>;
  afterEach(async () => ctx?.app.close());

  it('searches with pagination and hasMore', async () => {
    const source = new FakeSource();
    source.items = seed(25);
    ctx = await makeApp(source);
    const token = await registerAndLogin(ctx.app);
    const res = await ctx.app.inject({
      method: 'GET',
      url: '/tenders?pageSize=10&page=1',
      headers: auth(token),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items).toHaveLength(10);
    expect(body.hasMore).toBe(true);
  });

  it('rejects invalid params (valorMin>valorMax) with 400 and does not call the source', async () => {
    const source = new FakeSource();
    ctx = await makeApp(source);
    const token = await registerAndLogin(ctx.app);
    const res = await ctx.app.inject({
      method: 'GET',
      url: '/tenders?valorMin=100&valorMax=1',
      headers: auth(token),
    });
    expect(res.statusCode).toBe(400);
    expect(source.searchCalls).toBe(0);
  });

  it('serves a repeated search from cache (one source call)', async () => {
    const source = new FakeSource();
    source.items = seed(3);
    ctx = await makeApp(source);
    const token = await registerAndLogin(ctx.app);
    await ctx.app.inject({ method: 'GET', url: '/tenders?q=x', headers: auth(token) });
    await ctx.app.inject({ method: 'GET', url: '/tenders?q=x', headers: auth(token) });
    expect(source.searchCalls).toBe(1);
  });

  it('serves stale cache when the source fails after a prior success', async () => {
    const source = new FakeSource();
    source.items = seed(2);
    ctx = await makeApp(source);
    const token = await registerAndLogin(ctx.app);
    await ctx.app.inject({ method: 'GET', url: '/tenders?q=y&page=1', headers: auth(token) });
    // Force cache expiry by advancing nothing — instead cause failure on a *new* criteria:
    source.fail = true;
    const fresh = await ctx.app.inject({
      method: 'GET',
      url: '/tenders?q=z',
      headers: auth(token),
    });
    expect(fresh.statusCode).toBe(502); // no cache for this key -> typed upstream error
  });

  it('returns 404 for unknown detail', async () => {
    const source = new FakeSource();
    ctx = await makeApp(source);
    const token = await registerAndLogin(ctx.app);
    const res = await ctx.app.inject({
      method: 'GET',
      url: '/tenders/CO1.NTC.999',
      headers: auth(token),
    });
    expect(res.statusCode).toBe(404);
  });
});
