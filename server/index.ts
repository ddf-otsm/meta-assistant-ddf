import express, { type Request, Response, NextFunction } from 'express';

import logger from '../config/node/logger';

import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check requested');
  res.status(200).json({ status: 'ok' });
});

interface ResponseWithCustomJson extends Response {
  json: (body: unknown, ...args: unknown[]) => this;
}

app.use((req: Request, res: ResponseWithCustomJson, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      logger.http(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  interface ServerError extends Error {
    status?: number;
    statusCode?: number;
  }

  app.use((err: ServerError, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    logger.error(`Error: ${message}`, { status, stack: err.stack });
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable or default to 3000
  const port = process.env.PORT || 3000;

  server.listen(
    {
      port: Number(port),
      host: '0.0.0.0',
    },
    () => {
      logger.info(`Server started on 0.0.0.0:${port}`);
    }
  );
})();
