// Env config with fail-fast validation (task 1.3).
// Required secrets missing => process exits at startup.

export interface Config {
  port: number;
  databasePath: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  sodaDataset: string;
  sodaAppToken?: string;
  cromaApiKey?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error(
      'JWT_SECRET is required and must be at least 16 characters. Set it in your environment.',
    );
  }

  return {
    port: Number(env.PORT ?? 3000),
    databasePath: env.DATABASE_PATH ?? './data/portal.sqlite',
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '1h',
    sodaDataset: env.SODA_DATASET ?? 'jbjy-vk9h',
    sodaAppToken: env.SODA_APP_TOKEN || undefined,
    cromaApiKey: env.CROMA_API_KEY || undefined,
  };
}
