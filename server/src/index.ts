import express from 'express';
import cors from 'cors';
import { createRotatingLogger } from './config/log-rotation.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupRoutes } from './routes.js';

const app = express();
const port = process.env.PORT || 3000;

// Create logger
const logger = createRotatingLogger('server');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
setupRoutes(app);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  logger.debug('Health check requested');
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export { app };
