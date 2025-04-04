import cors from 'cors';
import express, { json, urlencoded } from 'express';
import session from 'express-session';

import { setupLogRotation } from './config/log-rotation';
import { setupLogging } from './config/logging_config';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';

const app = express();

// Setup logging
setupLogging();
const logger = setupLogRotation();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
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
setupRoutes(app);

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
  logger.info(`Server is running on port ${PORT}`);
});

export { app };
