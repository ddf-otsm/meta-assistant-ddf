import { Router } from 'express';
import { createRotatingLogger } from '../config/log-rotation.js';

const logger = createRotatingLogger('routes');
const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'ok' });
});

// Example route with logging
router.get('/example', (req, res) => {
  logger.info('Example route accessed', {
    query: req.query,
    params: req.params,
  });
  res.json({ message: 'Example route' });
});

export default router;
