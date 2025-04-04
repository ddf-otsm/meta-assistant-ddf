import fs from 'fs';
import path from 'path';

import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to Winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log file paths
const appLogPath = path.join(logsDir, 'app.log');
const errorLogPath = path.join(logsDir, 'error.log');

// Create empty log files if they don't exist
if (!fs.existsSync(appLogPath)) {
  fs.writeFileSync(appLogPath, '');
}

if (!fs.existsSync(errorLogPath)) {
  fs.writeFileSync(errorLogPath, '');
}

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console(),

  // File transport for all logs
  new winston.transports.File({
    filename: appLogPath,
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    handleExceptions: true,
  }),

  // Error log file
  new winston.transports.File({
    filename: errorLogPath,
    level: 'error',
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    handleExceptions: true,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: 'http', // Set default level to http to ensure http logs are captured
  levels,
  format,
  transports,
  exitOnError: false,
}) as winston.Logger & { http: winston.LeveledLogMethod };

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.log('http', message.trim());
  },
};

export default logger;
