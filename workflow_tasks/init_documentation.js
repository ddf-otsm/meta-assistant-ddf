#!/usr/bin/env node

/**
 * Script to initialize documentation structure for the baby monitor project
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function initDocumentation() {
  console.log('Initializing project documentation structure...');
  
  const exportDir = path.join(projectRoot, 'export');
  const babyMonitorDir = path.join(exportDir, 'baby-monitor');
  
  // Create export directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
    console.log(`Created export directory at ${exportDir}`);
  }
  
  // Create baby-monitor directory if it doesn't exist
  if (!fs.existsSync(babyMonitorDir)) {
    fs.mkdirSync(babyMonitorDir, { recursive: true });
    console.log(`Created baby-monitor directory at ${babyMonitorDir}`);
    
    // Create README.md
    const readmePath = path.join(babyMonitorDir, 'README.md');
    const readmeContent = `# Baby Monitor Documentation

This directory contains the documentation for the baby monitor project.

## Directory Structure

- docs/: Detailed documentation and plans
  - architecture/: System design and architecture documentation
  - implementations/: Specific implementation examples and guides
  - plans/: Transformation and execution plans
  - generators/: Generator implementation details
`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`Created README.md at ${readmePath}`);
  }
  
  // Create directory structure if it doesn't exist
  const docsDir = path.join(babyMonitorDir, 'docs');
  const architectureDir = path.join(docsDir, 'architecture');
  const implementationsDir = path.join(docsDir, 'implementations');
  const plansDir = path.join(docsDir, 'plans');
  const generatorsDir = path.join(docsDir, 'generators');
  
  const directories = [
    docsDir,
    architectureDir,
    implementationsDir,
    plansDir,
    generatorsDir
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory at ${dir}`);
    }
  }
  
  // Copy documentation from docs/todos/plans/baby_monitor_transformation directory
  const sourceDocs = [
    {
      src: path.join(projectRoot, 'docs/todos/plans/baby_monitor_transformation/transformation_plan.md'),
      dest: path.join(architectureDir, 'transformation-architecture.md')
    },
    {
      src: path.join(projectRoot, 'docs/todos/plans/baby_monitor_transformation/generator_system.md'),
      dest: path.join(architectureDir, 'generator-system.md')
    },
    {
      src: path.join(projectRoot, 'docs/todos/plans/baby_monitor_transformation/kettle_implementation.md'),
      dest: path.join(implementationsDir, 'kettle-monitor.md')
    },
    {
      src: path.join(projectRoot, 'docs/todos/plans/baby_monitor_transformation/pet_monitor_example.md'),
      dest: path.join(implementationsDir, 'pet-monitor.md')
    },
    {
      src: path.join(projectRoot, 'docs/todos/plans/finished/baby_monitor_use_case.md'),
      dest: path.join(plansDir, 'transformation-plan.md')
    },
    {
      src: path.join(projectRoot, 'docs/todos/plans/baby_monitor_transformation/generator_implementation.md'),
      dest: path.join(generatorsDir, 'implementation.md')
    },
    {
      src: path.join(projectRoot, 'docs/todos/plans/baby_monitor_transformation/README.md'),
      dest: path.join(generatorsDir, 'README.md')
    }
  ];
  
  for (const doc of sourceDocs) {
    if (fs.existsSync(doc.src)) {
      // Create parent directory if it doesn't exist
      const parentDir = path.dirname(doc.dest);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      
      fs.copyFileSync(doc.src, doc.dest);
      console.log(`Copied ${doc.src} to ${doc.dest}`);
    } else {
      console.warn(`Source file ${doc.src} not found, skipping`);
    }
  }
  
  console.log('Documentation structure initialized successfully!');
}

initDocumentation().catch(error => {
  console.error('Error initializing documentation:', error);
  process.exit(1);
}); 