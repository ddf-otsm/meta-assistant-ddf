import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import axios from 'axios';

// Helper functions
const commandExists = (command: string): boolean => {
  try {
    execSync(`command -v ${command}`);
    return true;
  } catch {
    return false;
  }
};

const containerIsRunning = (containerName: string): boolean => {
  try {
    const output = execSync(`docker ps --format '{{.Names}}'`).toString();
    return output.includes(containerName);
  } catch {
    return false;
  }
};

const containerIsHealthy = (containerName: string): boolean => {
  try {
    const status = execSync(`docker inspect -f '{{.State.Health.Status}}' ${containerName}`).toString().trim();
    return status === 'healthy';
  } catch {
    return false;
  }
};

describe('Docker Setup', () => {
  beforeAll(() => {
    // Ensure Docker is running
    try {
      execSync('docker info');
    } catch {
      throw new Error('Docker daemon is not running');
    }
  });

  describe('Docker Installation', () => {
    it('should have Docker installed', () => {
      expect(commandExists('docker')).toBe(true);
    });

    it('should have Docker Compose installed', () => {
      expect(commandExists('docker-compose')).toBe(true);
    });
  });

  describe('Docker Containers', () => {
    it('should have app container running', () => {
      expect(containerIsRunning('docker-app-1')).toBe(true);
    });

    it('should have database container running', () => {
      expect(containerIsRunning('docker-db-1')).toBe(true);
    });

    it('should have healthy app container', () => {
      expect(containerIsHealthy('docker-app-1')).toBe(true);
    });

    it('should have healthy database container', () => {
      expect(containerIsHealthy('docker-db-1')).toBe(true);
    });
  });

  describe('Application Health', () => {
    it('should respond to health check endpoint', async () => {
      const response = await axios.get('http://localhost:3000/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'ok');
    });

    it('should have database connection', () => {
      const output = execSync('docker exec docker-db-1 pg_isready -U postgres').toString();
      expect(output).toMatch(/accepting connections/);
    });
  });

  describe('Environment Configuration', () => {
    it('should have required environment variables in app container', () => {
      const env = execSync('docker exec docker-app-1 printenv').toString();
      expect(env).toMatch(/DATABASE_URL=/);
      expect(env).toMatch(/NODE_ENV=/);
    });
  });
}); 