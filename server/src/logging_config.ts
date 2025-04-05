import { Logger } from 'winston';

import { createRotatingLogger } from './config/log-rotation.js';

const loggers: Map<string, Logger> = new Map();

export function getLogger(name: string): Logger {
  if (!loggers.has(name)) {
    loggers.set(name, createRotatingLogger(name));
  }
  const logger = loggers.get(name);
  if (!logger) {
    throw new Error(`Logger ${name} not found`);
  }
  return logger;
}
