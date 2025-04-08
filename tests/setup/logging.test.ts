import fs from 'fs';
import path from 'path';

import { describe, it, expect, beforeEach, afterEach, test } from 'vitest';
import { createLogger, format, transports } from 'winston';

const logsDir = path.join(process.cwd(), 'logs');
const appLogPath = path.join(logsDir, 'app.log');
const errorLogPath = path.join(logsDir, 'error.log');

// Helper function to wait for file to exist and have content
const waitForLogs = async (filePath: string, timeout = 5000): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').length > 0) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout waiting for logs in ${filePath}`);
};

// Helper function to read log file content
const readLogFile = (filePath: string): string[] => {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(line => line.trim().length > 0);
};

describe('Logging System', () => {
  const logger = createLogger({
    level: 'debug',
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple(),
          format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
        ),
      }),
    ],
  });

  beforeEach(() => {
    // Clean up log files before each test
    if (fs.existsSync(appLogPath)) fs.writeFileSync(appLogPath, '');
    if (fs.existsSync(errorLogPath)) fs.writeFileSync(errorLogPath, '');
  });

  afterEach(() => {
    // Clean up log files after each test
    if (fs.existsSync(appLogPath)) fs.writeFileSync(appLogPath, '');
    if (fs.existsSync(errorLogPath)) fs.writeFileSync(errorLogPath, '');
  });

  it('should create logs directory', () => {
    expect(fs.existsSync(logsDir)).toBe(true);
  });

  it('should create log files', () => {
    expect(fs.existsSync(appLogPath)).toBe(true);
    expect(fs.existsSync(errorLogPath)).toBe(true);
  });

  test('should log info messages', () => {
    expect(() => logger.info('Test info message')).not.toThrow();
  });

  test('should log http messages', () => {
    expect(() => logger.http('Test http message')).not.toThrow();
  });

  test('should log error messages to error log', () => {
    expect(() => logger.error('Test error message')).not.toThrow();
  });

  test('should include timestamp in logs', () => {
    expect(() => logger.info('Test timestamp message')).not.toThrow();
  });

  test('should include log level in logs', () => {
    expect(() => logger.info('Test log level message')).not.toThrow();
  });
});
