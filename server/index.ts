import cors from 'cors';
import express, { json, urlencoded, type Request, Response, NextFunction } from 'express';
import session from 'express-session';

import { config } from './config_loader.js';
import { setupVite, serveStatic, log } from './vite.js';
import { createRotatingLogger } from './src/config/log-rotation.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { registerRoutes } from './routes.js';

const logger = createRotatingLogger('server');
const app = express();

// Middleware
app.use(cors({
  origin: config.security.cors.origins,
  methods: config.security.cors.methods
}));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  session({
    secret: config.security.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: config.security.session_expiry_hours * 60 * 60 * 1000
    }
  })
);

(async () => {
  const server = await registerRoutes(app);

  // Error handling
  app.use(errorHandler);
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    logger.error(err);
  });

  // Setup Vite in development mode
  if (config.server.environment === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = config.server.port;
  const host = config.server.host;
  
  server.listen(port, host, () => {
    logger.info(`Server is running on ${host}:${port} in ${config.server.environment} mode`);
  });
})();
