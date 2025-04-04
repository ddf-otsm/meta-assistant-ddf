import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { describe, it, expect } from 'vitest';

// Helper functions
const fileExists = (filepath: string): boolean => fs.existsSync(filepath);
const isSymlink = (filepath: string): boolean => fs.lstatSync(filepath).isSymbolicLink();
const commandExists = (command: string): boolean => {
  try {
    execSync(`command -v ${command}`);
    return true;
  } catch {
    return false;
  }
};

// Test suites
describe('Project Configuration', () => {
  describe('Required Tools', () => {
    it('should have Node.js installed', () => {
      expect(commandExists('node')).toBe(true);
    });

    it('should have npm installed', () => {
      expect(commandExists('npm')).toBe(true);
    });

    it('should have required npm packages', () => {
      const packageJson = JSON.parse(fs.readFileSync('config/node/package.json', 'utf-8'));
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.dependencies).toHaveProperty('typescript');
      expect(packageJson.dependencies).toHaveProperty('vite');
    });
  });

  describe('Configuration Files', () => {
    it('should have all required config files', () => {
      expect(fileExists('config/node/package.json')).toBe(true);
      expect(fileExists('config/typescript/tsconfig.json')).toBe(true);
      expect(fileExists('config/vite/vite.config.ts')).toBe(true);
      expect(fileExists('config/docker/Dockerfile')).toBe(true);
      expect(fileExists('config/docker/docker-compose.yml')).toBe(true);
      expect(fileExists('config/env/.env.example')).toBe(true);
    });

    it('should have correct symlinks at root', () => {
      expect(isSymlink('package.json')).toBe(true);
      expect(isSymlink('tsconfig.json')).toBe(true);
      expect(isSymlink('vite.config.ts')).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    it('should have required environment variables in .env.example', () => {
      const envExample = fs.readFileSync('config/env/.env.example', 'utf-8');
      expect(envExample).toMatch(/DATABASE_URL=/);
      expect(envExample).toMatch(/PORT=/);
      expect(envExample).toMatch(/NODE_ENV=/);
    });
  });
});
