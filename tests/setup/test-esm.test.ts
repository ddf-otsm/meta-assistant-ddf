import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const baseDir = path.dirname(fileURLToPath(import.meta.url));

const cjsPatterns = [
  /require\(['"]([^'"]+)['"]\)/g,
  /module\.exports\s*=/g,
  /exports\.\w+\s*=/g,
  /\b__dirname\b/g,
  /\b__filename\b/g
];

const importPattern = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g;

function checkForCJSPatterns(content: string, filePath: string): string[] {
  const issues: string[] = [];
  cjsPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push(`Found CJS pattern "${match}" in ${filePath}`);
      });
    }
  });
  return issues;
}

function checkImportPaths(content: string, filePath: string): string[] {
  const issues: string[] = [];
  const matches = content.matchAll(importPattern);
  for (const match of matches) {
    const importPath = match[1];
    if (!importPath.endsWith('.js') && !importPath.startsWith('http')) {
      issues.push(`Import path "${importPath}" in ${filePath} should end with .js`);
    }
  }
  return issues;
}

function findFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        files.push(...findFiles(fullPath));
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('ESM Compliance', () => {
  test('no CommonJS patterns should be present', () => {
    const projectRoot = path.resolve(baseDir, '../..');
    const files = findFiles(projectRoot);
    const issues: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      issues.push(...checkForCJSPatterns(content, file));
    }
    expect(issues).toHaveLength(0);
  });

  test('all imports should be properly formatted', () => {
    const projectRoot = path.resolve(baseDir, '../..');
    const files = findFiles(projectRoot);
    const issues: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      issues.push(...checkImportPaths(content, file));
    }
    expect(issues).toHaveLength(0);
  });

  test('package.json should have type: module', () => {
    const packageJsonPath = path.resolve(baseDir, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.type).toBe('module');
  });

  test('all TypeScript files should use .js extensions in imports', () => {
    const projectRoot = path.resolve(baseDir, '../..');
    const files = findFiles(projectRoot);
    const issues: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      issues.push(...checkImportPaths(content, file));
    }
    expect(issues).toHaveLength(0);
  });
}); 