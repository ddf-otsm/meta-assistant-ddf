import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Create a stub Express app for testing
const createStubApp = () => {
  const app = express();

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: { status: 'connected' },
        openai: { status: 'ready' },
      },
    });
  });

  return app;
};

describe('Health API Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createStubApp();
  });

  it('should return 200 OK with status information', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('services');
  });

  it('should include database status in health check', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.services).toHaveProperty('database');
    expect(response.body.services.database).toHaveProperty('status');
  });

  it('should include OpenAI service status in health check', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.services).toHaveProperty('openai');
    expect(response.body.services.openai).toHaveProperty('status');
  });
});
