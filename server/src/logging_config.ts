import { Logger } from 'winston';
import { createRotatingLogger } from './config/log-rotation';

const loggers: Map<string, Logger> = new Map();

export function getLogger(name: string): Logger {
  if (!loggers.has(name)) {
    loggers.set(name, createRotatingLogger(name));
  }
  return loggers.get(name)!;
} 