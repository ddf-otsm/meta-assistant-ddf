import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { describe, test, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CJS_PATTERNS = [
  /require\(['"]([^'"]+)['"]\)/g, // require() statements
  /module\.exports\s*=/g, // module.exports
  /exports\.\w+\s*=/g, // exports.something
  /__dirname/g, // __dirname usage
  /__filename/g, // __filename usage
];

const IMPORT_PATTERNS = [
  /from\s+['"]([^'"]+)['"]/g, // import from statements
  /import\s+['"]([^'"]+)['"]/g, // import statements
];

const EXCLUDED_DIRS = [
  'node_modules',
  'dist',
  '.git',
  'coverage',
  'tests/coverage',
];

const EXCLUDED_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
];

function isExcludedPath(filePath: string): boolean {
  return EXCLUDED_DIRS.some(dir => filePath.includes(`/${dir}/`)) ||
         EXCLUDED_FILES.some(file => filePath.endsWith(file));
}

function checkFileForCJSPatterns(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues: string[] = [];

  CJS_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push(`Found CJS pattern "${match}" in ${filePath}`);
      });
    }
  });

  return issues;
}

function checkFileForImportIssues(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues: string[] = [];

  IMPORT_PATTERNS.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const importPath = match[1];
      
      // Check for missing .js extension in relative imports
      if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
        issues.push(`Import path "${importPath}" in ${filePath} should end with .js`);
      }
    }
  });

  return issues;
}

function findFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (isExcludedPath(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath));
    } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('ESM Compliance', () => {
  test('no CommonJS patterns should be present', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const files = findFiles(projectRoot);
    const issues: string[] = [];

    files.forEach(file => {
      const fileIssues = checkFileForCJSPatterns(file);
      issues.push(...fileIssues);
    });

    if (issues.length > 0) {
      console.error('\nFound CommonJS patterns:');
      issues.forEach(issue => console.error(`- ${issue}`));
    }

    expect(issues).toHaveLength(0);
  });

  test('all imports should be properly formatted', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const files = findFiles(projectRoot);
    const issues: string[] = [];

    files.forEach(file => {
      const fileIssues = checkFileForImportIssues(file);
      issues.push(...fileIssues);
    });

    if (issues.length > 0) {
      console.error('\nFound import issues:');
      issues.forEach(issue => console.error(`- ${issue}`));
    }

    expect(issues).toHaveLength(0);
  });

  test('package.json should have type: module', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));
    expect(packageJson.type).toBe('module');
  });

  test('all TypeScript files should use .js extensions in imports', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const files = findFiles(projectRoot);
    const issues: string[] = [];

    files.forEach(file => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const content = fs.readFileSync(file, 'utf8');
      const importPattern = /from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importPattern.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
          issues.push(`Import path "${importPath}" in ${file} should end with .js`);
        }
      }
    });

    if (issues.length > 0) {
      console.error('\nFound TypeScript files with incorrect import extensions:');
      issues.forEach(issue => console.error(`- ${issue}`));
    }

    expect(issues).toHaveLength(0);
  });
}); 