import { Request, Response, NextFunction } from 'express';
import { createRotatingLogger } from '../config/log-rotation.js';

const logger = createRotatingLogger('error-handler');

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Error occurred', { error: err });

  res.status(500).json({
    error: {
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
}
