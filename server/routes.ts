import { Router } from 'express';

import { validateRequest } from '@shared/schema.js';

import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.post('/validate', validateRequest, (req, res) => {
  logger.info('Validation request received');
  res.json({ valid: true });
});

// Error handling middleware
router.use(errorHandler);

export default router;
