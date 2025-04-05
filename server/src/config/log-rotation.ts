import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(baseDir, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function createRotatingLogger(name: string): Logger {
  const logger = createLogger({
    level: 'debug',
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
    ),
    transports: [
      new transports.DailyRotateFile({
        filename: path.join(logDir, `${name}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'debug',
      }),
      new transports.DailyRotateFile({
        filename: path.join(logDir, `${name}-error-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
      }),
    ],
  });

  // Add console transport in development
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple(),
          format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
        ),
      })
    );
  }

  return logger;
}
