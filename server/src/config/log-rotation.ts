import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Creates a logger with rotating file transport
 * @param name The name of the logger
 * @returns A Winston logger instance with daily rotation
 */
export function createRotatingLogger(name: string): winston.Logger {
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss:ms'
      }),
      winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    defaultMeta: { service: name },
    transports: [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
          )
        )
      }),
      
      // File transports with rotation
      new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, `%DATE%-${name}.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d'
      }),
      
      // Separate error log
      new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, `%DATE%-${name}-error.log`),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });
  
  return logger;
}
