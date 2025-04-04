import cors from 'cors';
import express from 'express';
import session from 'express-session';

import { db } from './config/database';
import { getLogger } from './logging_config';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';

const logger = getLogger('server');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  logger.debug('Health check requested');
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

export { app };
