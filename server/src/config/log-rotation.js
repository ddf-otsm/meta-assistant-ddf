import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

/**
 * Create a rotating logger
 * @param {string} module - Module name for the logger
 * @returns {import('winston').Logger} - Winston logger
 */
export function createRotatingLogger(module) {
  const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: 'meta-assistant', module },
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            ({ level, message, timestamp, module, ...rest }) =>
              `${timestamp} [${module}] ${level}: ${message} ${
                Object.keys(rest).length ? JSON.stringify(rest) : ''
              }`
          )
        ),
      }),
    ],
  });

  // Add file rotation in production
  if (process.env.NODE_ENV === 'production') {
    logger.add(
      new transports.DailyRotateFile({
        filename: `logs/%DATE%-${module}.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      })
    );
  }

  return logger;
} 