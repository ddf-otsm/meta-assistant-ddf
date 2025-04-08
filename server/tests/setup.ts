import { beforeAll, afterAll } from 'vitest';
import { createRotatingLogger } from '../src/config/log-rotation.js';
import { app } from '../src/index.js';

const logger = createRotatingLogger('test-setup');

beforeAll(() => {
  logger.info('Setting up test environment');
});

afterAll(() => {
  logger.info('Cleaning up test environment');
});
