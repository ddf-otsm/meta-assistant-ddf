import cors from 'cors';
import express, { json, urlencoded } from 'express';
import session from 'express-session';

import { setupLogRotation } from './config/log-rotation';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';

const logger = setupLogRotation();
const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
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
