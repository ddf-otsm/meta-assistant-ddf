import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { schema } from '@shared/schema';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const router = express.Router();

// Health check endpoint
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// API routes
router.use('/api', schema);

// Error handling
router.use(errorHandler);

// Create HTTP server
const app = express();
app.use(router);

const httpServer = createServer(app);
const io = new Server(httpServer);

export { httpServer, io };
