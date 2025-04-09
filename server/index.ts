import cors from 'cors';
import express, { json, urlencoded, type Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "./config_loader";

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
    secret: config.security.session_secret || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

(async () => {
  // Set up legacy routes
  setupRoutes(app);
  
  // Set up new routes
  const server = await registerRoutes(app);

  // Error handling - legacy
  app.use(errorHandler);
  
  // Error handling - new
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    logger.error(err);
  });

  // Development mode - setup Vite
  if (config.server.environment === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use the port from config
  const port = config.server.port || process.env.PORT || 3000;
  const host = config.server.host || 'localhost';
  
  server.listen(port, () => {
    logger.info(`Server is running on port ${port} in ${config.server.environment} mode`);
    log(`serving on port ${port} in ${config.server.environment} mode`);
  });
})();
