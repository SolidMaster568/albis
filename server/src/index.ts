import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

const start = async () => {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`ALBIS API listening on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start ALBIS API', error);
  process.exit(1);
});
