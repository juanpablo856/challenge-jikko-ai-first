import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { unauthorized } from '../errors.js';

// Registers @fastify/jwt (HS256) and an `authenticate` preHandler that validates the
// token and attaches request.user. Domain routes opt in via { preHandler: app.authenticate }.
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: number };
    user: { id: number };
  }
}

export interface AuthPluginOpts {
  secret: string;
  expiresIn: string;
}

export const authPlugin = fp(async (app: FastifyInstance, opts: AuthPluginOpts) => {
  app.register(fastifyJwt, {
    secret: opts.secret,
    sign: { algorithm: 'HS256', expiresIn: opts.expiresIn },
    // Map JWT `sub` claim to request.user.id
    formatUser: (payload) => ({ id: Number((payload as { sub: number }).sub) }),
  });

  app.decorate('authenticate', async (req: FastifyRequest) => {
    try {
      await req.jwtVerify();
    } catch {
      throw unauthorized('token ausente o inválido');
    }
  });
});
