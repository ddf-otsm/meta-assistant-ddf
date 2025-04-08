import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

describe('Health API', () => {
  it('should return 200 and ok status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
