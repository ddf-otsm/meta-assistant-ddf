import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

vi.mock('../../../../server/src/config/log-rotation.js', () => {
  const mockError = vi.fn();
  const mockInfo = vi.fn();
  return {
    createRotatingLogger: () => ({
      error: mockError,
      info: mockInfo,
    }),
    __mockError: mockError,
    __mockInfo: mockInfo,
  };
});

import { errorHandler, AppError } from '../../../../server/src/middleware/errorHandler';
import { createRotatingLogger } from '../../../../server/src/config/log-rotation';

const mockModule = await import('../../../../server/src/config/log-rotation.js');
const mockError = (mockModule as any).__mockError;
const mockInfo = (mockModule as any).__mockInfo;

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: '/test',
      method: 'GET',
      body: {},
      query: {},
      params: {},
      ip: '127.0.0.1'
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn() as unknown as NextFunction;
    vi.clearAllMocks();
  });

  it('should handle operational errors correctly', () => {
    const error = new AppError(400, 'Test error');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        message: 'Test error',
        status: 400,
        isOperational: true
      }
    });
  });

  it('should handle non-operational errors with 500 status', () => {
    const error = new Error('Unexpected error');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        message: 'An unexpected error occurred',
        status: 500,
        isOperational: false
      }
    });
  });

  it('should log operational errors', () => {
    const error = new AppError(400, 'Test error');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockError).toHaveBeenCalledWith(
      'Error occurred',
      expect.objectContaining({
        error: expect.any(AppError),
        path: '/test',
        method: 'GET',
        body: {},
        query: {},
        params: {},
        ip: '127.0.0.1'
      })
    );
  });

  it('should log non-operational errors with stack trace', () => {
    const error = new Error('Unexpected error');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockError).toHaveBeenCalledWith(
      'Error occurred',
      expect.objectContaining({
        error: expect.any(Error),
        path: '/test',
        method: 'GET',
        body: {},
        query: {},
        params: {},
        ip: '127.0.0.1'
      })
    );
  });

  it('should handle errors with custom status code', () => {
    const error = new AppError(404, 'Not found');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        message: 'Not found',
        status: 404,
        isOperational: true
      }
    });
  });
}); 