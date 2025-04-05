import cors from 'cors';
import express, { json, urlencoded } from 'express';
import session from 'express-session';

import { createRotatingLogger } from './src/config/log-rotation.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { setupRoutes } from './src/routes.js';

const logger = createRotatingLogger('server');
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

// Routes
setupRoutes(app);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
