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
    info: (message: string) => logger.info(`[${module}] ${message}`),
    error: (message: string) => logger.error(`[${module}] ${message}`),
    warn: (message: string) => logger.warn(`[${module}] ${message}`),
    debug: (message: string) => logger.debug(`[${module}] ${message}`),
  };
};
