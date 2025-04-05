import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(baseDir, '..');

// Patterns to identify imports that need .js extension
const importPattern = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g;

// Files and directories to exclude
const excludeDirs = ['node_modules', 'dist', '.git'];
const excludeFiles = ['package.json', 'tsconfig.json'];

// Node.js built-in modules
const builtinModules = new Set([
  'fs', 'path', 'url', 'http', 'https', 'child_process', 'crypto', 'events',
  'os', 'stream', 'util', 'assert', 'buffer', 'cluster', 'console', 'constants',
  'dgram', 'dns', 'domain', 'net', 'process', 'punycode', 'querystring',
  'readline', 'repl', 'string_decoder', 'timers', 'tls', 'tty', 'v8', 'vm', 'zlib'
]);

function isNodeBuiltin(importPath: string): boolean {
  return builtinModules.has(importPath);
}

function isExternalPackage(importPath: string): boolean {
  // External packages start with @ or don't have a path separator
  return importPath.startsWith('@') || !importPath.includes('/');
}

function shouldAddJsExtension(importPath: string): boolean {
  // Don't add .js if it already has an extension
  if (importPath.endsWith('.js')) {
    return false;
  }

  // Don't add .js to URLs
  if (importPath.startsWith('http')) {
    return false;
  }

  // Don't add .js to Node.js built-ins
  if (isNodeBuiltin(importPath)) {
    return false;
  }

  // Don't add .js to external packages
  if (isExternalPackage(importPath)) {
    return false;
  }

  return true;
}

function fixImportPath(importPath: string): string {
  if (shouldAddJsExtension(importPath)) {
    return `${importPath}.js`;
  }
  return importPath;
}

function processFile(filePath: string, dryRun: boolean = true): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: string[] = [];
  let newContent = content;

  const matches = content.matchAll(importPattern);
  for (const match of matches) {
    const importPath = match[1];
    if (shouldAddJsExtension(importPath)) {
      const fixedPath = fixImportPath(importPath);
      const originalImport = match[0];
      const fixedImport = originalImport.replace(importPath, fixedPath);
      
      if (dryRun) {
        issues.push(`Would fix: ${originalImport} -> ${fixedImport}`);
      } else {
        newContent = newContent.replace(originalImport, fixedImport);
      }
    }
  }

  if (!dryRun && newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  return issues;
}

function findFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        files.push(...findFiles(fullPath));
      }
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !excludeFiles.includes(entry.name)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  console.log(`Running in ${dryRun ? 'dry-run' : 'fix'} mode`);

  const files = findFiles(projectRoot);
  console.log(`Found ${files.length} TypeScript files to process`);

  const allIssues: string[] = [];
  for (const file of files) {
    const issues = processFile(file, dryRun);
    if (issues.length > 0) {
      allIssues.push(`\nFile: ${file}`);
      allIssues.push(...issues);
    }
  }

  if (allIssues.length > 0) {
    console.log('\nIssues found:');
    console.log(allIssues.join('\n'));
    console.log(`\nTotal issues: ${allIssues.length}`);
  } else {
    console.log('No issues found!');
  }
}

main().catch(console.error); 