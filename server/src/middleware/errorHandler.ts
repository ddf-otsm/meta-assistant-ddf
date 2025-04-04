import { Request, Response, NextFunction } from 'express';

import { getLogger } from '../config/logging_config';

const logger = getLogger('errorHandler');

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error occurred:', {
    error: err.message,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
