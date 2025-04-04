import { afterAll, beforeAll } from 'vitest';

import { db } from '../src/config/database';
import { app } from '../src/index';

beforeAll(async () => {
  // Setup test database
  await db.migrate();
});

afterAll(async () => {
  // Cleanup test database
  await db.destroy();
  app.close();
});
