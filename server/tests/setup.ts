import { afterAll, beforeAll } from 'vitest';
import { app } from '../src/index';
import { db } from '../src/config/database';

beforeAll(async () => {
  // Setup test database
  await db.migrate();
});

afterAll(async () => {
  // Cleanup test database
  await db.destroy();
  app.close();
}); 