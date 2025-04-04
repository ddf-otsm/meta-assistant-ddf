import { Router, Express } from 'express';

import { getLogger } from './config/logging_config';

const logger = getLogger('routes');
const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'ok' });
});

// AI endpoints
router.post('/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // TODO: Implement AI generation logic
    const response = { data: 'Generated response' };
    res.json(response);
  } catch (error) {
    logger.error('Error generating AI response:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export const setupRoutes = (app: Express) => {
  app.use('/api', router);
};
