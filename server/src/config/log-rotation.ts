import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

export const createRotatingLogger = (name: string) => {
  const logDir = 'logs';

  const rotateTransport = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%-${name}.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: format.combine(format.timestamp(), format.json()),
  });

  const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: name },
    transports: [
      rotateTransport,
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
    ],
  });

  rotateTransport.on('rotate', (oldFilename, newFilename) => {
    logger.info('Rotating log file', { oldFilename, newFilename });
  });

  return logger;
};
