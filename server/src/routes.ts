import { Express } from 'express';
import { createRotatingLogger } from './config/log-rotation.js';
import routes from './routes/index.js';
import documentationRoutes from './routes/documentation.js';

const logger = createRotatingLogger('routes-setup');

// Health check endpoint
routes.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'ok' });
});

// AI endpoints
routes.post('/ai/generate', async (req, res) => {
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

export function setupRoutes(app: Express) {
  logger.info('Setting up routes');
  app.use('/api', routes);
  app.use('/api', documentationRoutes);
}
