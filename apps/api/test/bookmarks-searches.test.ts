import { afterEach, describe, expect, it } from 'vitest';
import { auth, FakeSource, makeApp, registerAndLogin } from './helpers.js';
import type { TenderSummary } from '@portal/contracts';

const one: TenderSummary = {
  noticeUid: 'CO1.NTC.1',
  titulo: 'Obra',
  entidad: 'Alcaldía',
  valor: 1000,
  fecha: '2026-01-01',
  estado: 'Convocado',
};

describe('bookmarks', () => {
  let ctx: Awaited<ReturnType<typeof makeApp>>;
  afterEach(async () => ctx?.app.close());

  it('creates, prevents duplicates, isolates by user, and deletes', async () => {
    const source = new FakeSource();
    source.items = [one];
    ctx = await makeApp(source);
    const tokenA = await registerAndLogin(ctx.app, 'a@x.co');
    const tokenB = await registerAndLogin(ctx.app, 'b@x.co');

    const created = await ctx.app.inject({
      method: 'POST',
      url: '/bookmarks',
      headers: auth(tokenA),
      payload: { noticeUid: 'CO1.NTC.1', note: 'mira' },
    });
    expect(created.statusCode).toBe(201);
    const id = created.json().id;

    const dup = await ctx.app.inject({
      method: 'POST',
      url: '/bookmarks',
      headers: auth(tokenA),
      payload: { noticeUid: 'CO1.NTC.1' },
    });
    expect(dup.statusCode).toBe(409);

    const listB = await ctx.app.inject({ method: 'GET', url: '/bookmarks', headers: auth(tokenB) });
    expect(listB.json()).toHaveLength(0); // isolation

    const delByB = await ctx.app.inject({
      method: 'DELETE',
      url: `/bookmarks/${id}`,
      headers: auth(tokenB),
    });
    expect(delByB.statusCode).toBe(404); // not owner

    const delByA = await ctx.app.inject({
      method: 'DELETE',
      url: `/bookmarks/${id}`,
      headers: auth(tokenA),
    });
    expect(delByA.statusCode).toBe(204);
  });

  it('404 when the tender cannot be resolved for a snapshot', async () => {
    const source = new FakeSource();
    ctx = await makeApp(source);
    const token = await registerAndLogin(ctx.app);
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/bookmarks',
      headers: auth(token),
      payload: { noticeUid: 'CO1.NTC.404' },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe('saved-searches', () => {
  let ctx: Awaited<ReturnType<typeof makeApp>>;
  afterEach(async () => ctx?.app.close());

  it('saves, rejects unknown criteria fields, dedupes name, and applies results', async () => {
    const source = new FakeSource();
    source.items = [one];
    ctx = await makeApp(source);
    const token = await registerAndLogin(ctx.app);

    const bad = await ctx.app.inject({
      method: 'POST',
      url: '/searches',
      headers: auth(token),
      payload: { nombre: 'x', criteria: { bogus: 1 } },
    });
    expect(bad.statusCode).toBe(400);

    const ok = await ctx.app.inject({
      method: 'POST',
      url: '/searches',
      headers: auth(token),
      payload: { nombre: 'obras', criteria: { q: 'obra', pageSize: 5 } },
    });
    expect(ok.statusCode).toBe(201);
    const id = ok.json().id;

    const dup = await ctx.app.inject({
      method: 'POST',
      url: '/searches',
      headers: auth(token),
      payload: { nombre: 'obras', criteria: { q: 'otra' } },
    });
    expect(dup.statusCode).toBe(409);

    const results = await ctx.app.inject({
      method: 'GET',
      url: `/searches/${id}/results`,
      headers: auth(token),
    });
    expect(results.statusCode).toBe(200);
    expect(results.json().items).toHaveLength(1);
  });
});
