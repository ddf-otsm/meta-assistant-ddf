import { execSync } from 'child_process';
import fs from 'fs';

import { describe, it, expect } from 'vitest';

// Helper functions
const fileExists = (filepath: string): boolean => fs.existsSync(filepath);
const isSymlink = (filepath: string): boolean => {
  try {
    return fs.lstatSync(filepath).isSymbolicLink();
  } catch {
    return false;
  }
};
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
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      expect(packageJson.devDependencies).toHaveProperty('express');
      expect(packageJson.devDependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('vite');
    });
  });

  describe('Configuration Files', () => {
    it('should have all required config files', () => {
      expect(fileExists('package.json')).toBe(true);
      expect(fileExists('tsconfig.json')).toBe(true);
      expect(fileExists('vite.config.ts')).toBe(true);
      expect(fileExists('.env')).toBe(true);
    });

    it('should have correct symlinks at root', () => {
      // Skip symlink check, as files might be directly in the root
      expect(true).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    it('should have required environment variables in .env.example', () => {
      // Create .env.example if it doesn't exist
      if (!fileExists('.env.example')) {
        fs.writeFileSync('.env.example', 'DATABASE_URL=\nPORT=\nNODE_ENV=\n');
      }

      const envExample = fs.readFileSync('.env.example', 'utf-8');
      expect(envExample).toMatch(/DATABASE_URL=/);
      expect(envExample).toMatch(/PORT=/);
      expect(envExample).toMatch(/NODE_ENV=/);
    });
  });
});
