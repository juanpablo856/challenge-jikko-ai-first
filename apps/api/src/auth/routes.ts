import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../context.js';
import { conflict, notFound, unauthorized } from '../errors.js';
import { hashPassword, verifyPassword } from './password.js';

const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', format: 'email', maxLength: 254 },
      password: { type: 'string', minLength: 8, maxLength: 200 },
    },
  },
};

// Login only requires the fields present — it must NOT enforce the password *policy*,
// or a too-short wrong password would 400 instead of a uniform 401 (enumeration signal).
const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', maxLength: 254 },
      password: { type: 'string', maxLength: 200 },
    },
  },
};

export async function authRoutes(app: FastifyInstance, deps: AppDeps): Promise<void> {
  const users = deps.users;

  app.post<{ Body: { email: string; password: string } }>(
    '/auth/register',
    { schema: registerSchema },
    async (req, reply) => {
      const email = req.body.email.toLowerCase().trim();
      if (users.byEmail(email)) {
        // Generic message — no enumeration signal beyond the unavoidable 409.
        throw conflict('no fue posible completar el registro');
      }
      const user = users.create(email, hashPassword(req.body.password));
      return reply.status(201).send({ id: user.id, email: user.email });
    },
  );

  app.post<{ Body: { email: string; password: string } }>(
    '/auth/login',
    { schema: loginSchema },
    async (req, reply) => {
      const email = req.body.email.toLowerCase().trim();
      const user = users.byEmail(email);
      // Uniform response/branch for both "no user" and "bad password" to avoid
      // user enumeration. Always run a verify to keep timing similar.
      const dummy = 'scrypt$16384$00$00';
      const ok = user
        ? verifyPassword(req.body.password, user.password_hash)
        : (verifyPassword(req.body.password, dummy), false);
      if (!user || !ok) throw unauthorized('credenciales inválidas');

      const expiresIn = 3600;
      const accessToken = app.jwt.sign({ sub: user.id });
      return reply.send({ accessToken, expiresIn });
    },
  );

  app.get('/auth/me', { preHandler: app.authenticate }, async (req) => {
    const user = users.byId(req.user.id);
    if (!user) throw notFound('usuario no encontrado');
    return { id: user.id, email: user.email, created_at: user.created_at };
  });
}
