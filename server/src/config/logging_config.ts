import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

export const getLogger = (module: string) => {
  return {
    info: (message: string, meta?: Record<string, unknown>) =>
      logger.info(`[${module}] ${message}`, meta),
    error: (message: string, meta?: Record<string, unknown>) =>
      logger.error(`[${module}] ${message}`, meta),
    warn: (message: string, meta?: Record<string, unknown>) =>
      logger.warn(`[${module}] ${message}`, meta),
    debug: (message: string, meta?: Record<string, unknown>) =>
      logger.debug(`[${module}] ${message}`, meta),
  };
};
