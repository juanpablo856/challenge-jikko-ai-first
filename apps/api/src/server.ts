import { buildApp } from './app.js';
import { loadConfig } from './config.js';

// Fail-fast on missing/invalid required config, then start listening.
const config = loadConfig();
const app = await buildApp(config);

app
  .listen({ port: config.port, host: '0.0.0.0' })
  .then((addr) => console.log(`API listening on ${addr}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
