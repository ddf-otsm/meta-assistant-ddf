import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { Client } from 'pg';

// Helper functions
const commandExists = (command: string): boolean => {
  try {
    execSync(`command -v ${command}`);
    return true;
  } catch {
    return false;
  }
};

describe('PostgreSQL Setup', () => {
  let client: Client;

  beforeAll(async () => {
    // Check if PostgreSQL is installed
    if (!commandExists('psql')) {
      throw new Error('PostgreSQL is not installed');
    }

    // Initialize client
    client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'meta_assistant'
    });

    await client.connect();
  });

  describe('PostgreSQL Installation', () => {
    it('should have PostgreSQL installed', () => {
      expect(commandExists('psql')).toBe(true);
    });

    it('should have PostgreSQL running', () => {
      const output = execSync('pg_isready').toString();
      expect(output).toMatch(/accepting connections/);
    });
  });

  describe('Database Setup', () => {
    it('should connect to meta_assistant database', async () => {
      const result = await client.query('SELECT current_database()');
      expect(result.rows[0].current_database).toBe('meta_assistant');
    });

    it('should have postgres user with correct privileges', async () => {
      const result = await client.query(`
        SELECT has_database_privilege('postgres', 'meta_assistant', 'CONNECT') as has_connect,
               has_database_privilege('postgres', 'meta_assistant', 'CREATE') as has_create
      `);
      expect(result.rows[0].has_connect).toBe(true);
      expect(result.rows[0].has_create).toBe(true);
    });

    it('should have required extensions', async () => {
      const result = await client.query(`
        SELECT extname FROM pg_extension
      `);
      const extensions = result.rows.map(row => row.extname);
      expect(extensions).toContain('plpgsql');
    });
  });

  describe('Database Connection', () => {
    it('should use correct connection string format', () => {
      const envContent = execSync('cat .env').toString();
      const dbUrlRegex = /DATABASE_URL=postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+/;
      expect(dbUrlRegex.test(envContent)).toBe(true);
    });
  });
}); 