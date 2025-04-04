import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { getLogger } from '../logging_config';
import fs from 'fs';
import path from 'path';

describe('Logging Configuration', () => {
    const testLoggerName = 'test-logger';
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, `${testLoggerName}.log`);

    beforeEach(() => {
        // Clean up any existing log files
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
        }
    });

    afterEach(() => {
        // Clean up after tests
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
        }
    });

    test('creates logger with correct configuration', () => {
        const logger = getLogger(testLoggerName);
        expect(logger).toBeDefined();
        expect(logger.level).toBe('debug');
    });

    test('creates log file when logging', () => {
        const logger = getLogger(testLoggerName);
        logger.info('Test log message');
        
        // Wait a bit for the file to be written
        setTimeout(() => {
            expect(fs.existsSync(logFile)).toBe(true);
            const logContent = fs.readFileSync(logFile, 'utf8');
            expect(logContent).toContain('Test log message');
        }, 100);
    });

    test('handles error logging correctly', () => {
        const logger = getLogger(testLoggerName);
        const error = new Error('Test error');
        logger.error('Error occurred', { error });
        
        setTimeout(() => {
            const logContent = fs.readFileSync(logFile, 'utf8');
            expect(logContent).toContain('Error occurred');
            expect(logContent).toContain('Test error');
        }, 100);
    });
}); 