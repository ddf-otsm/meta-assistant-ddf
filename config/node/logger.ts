import fs from 'fs';
import path from 'path';

import {
  addColors,
  createLogger,
  format as winstonFormat,
  transports as winstonTransports,
  Logger,
  LeveledLogMethod,
} from 'winston';

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
addColors(colors);

// Define log format
const format = winstonFormat.combine(
  winstonFormat.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winstonFormat.colorize({ all: true }),
  winstonFormat.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
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
  new winstonTransports.Console(),

  // File transport for all logs
  new winstonTransports.File({
    filename: appLogPath,
    format: winstonFormat.combine(
      winstonFormat.uncolorize(),
      winstonFormat.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winstonFormat.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    handleExceptions: true,
  }),

  // Error log file
  new winstonTransports.File({
    filename: errorLogPath,
    level: 'error',
    format: winstonFormat.combine(
      winstonFormat.uncolorize(),
      winstonFormat.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winstonFormat.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    handleExceptions: true,
  }),
];

// Create the logger
const logger = createLogger({
  level: 'http', // Set default level to http to ensure http logs are captured
  levels,
  format,
  transports,
  exitOnError: false,
}) as Logger & { http: LeveledLogMethod };

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.log('http', message.trim());
  },
};

export default logger;
