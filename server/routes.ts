import { Router } from 'express';

import { validateRequest } from '@shared/schema';

import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

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
