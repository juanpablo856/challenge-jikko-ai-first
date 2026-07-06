import { afterEach, describe, expect, it } from 'vitest';
import { auth, makeApp, registerAndLogin } from './helpers.js';
import { hashPassword, verifyPassword } from '../src/auth/password.js';

describe('password hashing', () => {
  it('verifies a correct password and rejects a wrong one', () => {
    const h = hashPassword('secret123');
    expect(verifyPassword('secret123', h)).toBe(true);
    expect(verifyPassword('wrong', h)).toBe(false);
  });
});

describe('user-auth', () => {
  let ctx: Awaited<ReturnType<typeof makeApp>>;
  afterEach(async () => ctx?.app.close());

  it('registers, logs in, and returns profile', async () => {
    ctx = await makeApp();
    const reg = await ctx.app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'a@b.co', password: 'password123' },
    });
    expect(reg.statusCode).toBe(201);
    expect(reg.json()).toMatchObject({ email: 'a@b.co' });
    expect(reg.json().password_hash).toBeUndefined();

    const token = await registerAndLogin(ctx.app, 'c@d.co');
    const me = await ctx.app.inject({ method: 'GET', url: '/auth/me', headers: auth(token) });
    expect(me.statusCode).toBe(200);
    expect(me.json().email).toBe('c@d.co');
  });

  it('rejects duplicate email with 409', async () => {
    ctx = await makeApp();
    const payload = { email: 'dup@b.co', password: 'password123' };
    await ctx.app.inject({ method: 'POST', url: '/auth/register', payload });
    const res = await ctx.app.inject({ method: 'POST', url: '/auth/register', payload });
    expect(res.statusCode).toBe(409);
  });

  it('rejects invalid email/short password with 400', async () => {
    ctx = await makeApp();
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'nope', password: 'x' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns identical 401 for unknown email and wrong password', async () => {
    ctx = await makeApp();
    await ctx.app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'e@f.co', password: 'password123' },
    });
    const wrongPass = await ctx.app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'e@f.co', password: 'nope' },
    });
    const noUser = await ctx.app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'ghost@f.co', password: 'password123' },
    });
    expect(wrongPass.statusCode).toBe(401);
    expect(noUser.statusCode).toBe(401);
    expect(wrongPass.json()).toEqual(noUser.json());
  });

  it('blocks protected route without a token', async () => {
    ctx = await makeApp();
    const res = await ctx.app.inject({ method: 'GET', url: '/tenders' });
    expect(res.statusCode).toBe(401);
  });
});
