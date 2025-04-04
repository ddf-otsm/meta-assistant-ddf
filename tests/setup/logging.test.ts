import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import logger from '../../config/node/logger';

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
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(line => line.trim().length > 0);
};

describe('Logging System', () => {
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

  it('should log info messages', async () => {
    const testMessage = 'Test info message';
    logger.info(testMessage);
    
    await waitForLogs(appLogPath);
    const logs = readLogFile(appLogPath);
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1]).toContain(testMessage);
  });

  it('should log http messages', async () => {
    const testMessage = 'Test http message';
    logger.http(testMessage);
    
    await waitForLogs(appLogPath);
    const logs = readLogFile(appLogPath);
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1]).toContain(testMessage);
  });

  it('should log error messages to error log', async () => {
    const testMessage = 'Test error message';
    logger.error(testMessage);
    
    await waitForLogs(errorLogPath);
    const logs = readLogFile(errorLogPath);
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1]).toContain(testMessage);
  });

  it('should include timestamp in logs', async () => {
    logger.info('Test timestamp message');
    
    await waitForLogs(appLogPath);
    const logs = readLogFile(appLogPath);
    
    expect(logs.length).toBeGreaterThan(0);
    // Check for ISO date format YYYY-MM-DD HH:mm:ss
    expect(logs[logs.length - 1]).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  });

  it('should include log level in logs', async () => {
    logger.info('Test log level message');
    
    await waitForLogs(appLogPath);
    const logs = readLogFile(appLogPath);
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1]).toContain('info');
  });
}); 