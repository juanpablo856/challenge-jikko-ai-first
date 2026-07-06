import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { ApiError } from '@portal/contracts';

// Typed application error. Handlers throw these; the global handler renders them
// without leaking internals.
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, fields?: Record<string, string>) =>
  new AppError(400, 'bad_request', message, fields);
export const unauthorized = (message = 'credenciales inválidas') =>
  new AppError(401, 'unauthorized', message);
export const notFound = (message = 'recurso no encontrado') =>
  new AppError(404, 'not_found', message);
export const conflict = (message: string) => new AppError(409, 'conflict', message);
export const upstreamUnavailable = (message = 'fuente externa no disponible') =>
  new AppError(502, 'upstream_unavailable', message);

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((err, req: FastifyRequest, reply: FastifyReply) => {
    if (err instanceof AppError) {
      const body: ApiError = { error: err.error, message: err.message, fields: err.fields };
      return reply.status(err.statusCode).send(body);
    }
    // Fastify schema validation error
    if ((err as { validation?: unknown }).validation) {
      const body: ApiError = { error: 'bad_request', message: 'datos inválidos' };
      return reply.status(400).send(body);
    }
    if ((err as { statusCode?: number }).statusCode === 429) {
      return reply.status(429).send({ error: 'rate_limited', message: 'demasiadas peticiones' });
    }
    req.log.error(err);
    const body: ApiError = { error: 'internal', message: 'error interno' };
    return reply.status(500).send(body);
  });
}
