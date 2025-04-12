import { createRotatingLogger } from '../config/log-rotation.js';

const logger = createRotatingLogger('error-handler');

/**
 * Error handler middleware
 */
export function errorHandler(err, req, res, next) {
  logger.error('Error caught by middleware:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Get status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    statusCode,
  });
} 