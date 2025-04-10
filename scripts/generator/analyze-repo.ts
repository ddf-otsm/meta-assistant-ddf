#!/usr/bin/env tsx

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import simpleGit from 'simple-git';
import glob from 'glob';

const execPromise = promisify(exec);

/**
 * Repository analyzer that identifies codebase structure, patterns, and domain
 */
class RepositoryAnalyzer {
  repoPath: string;
  outputPath: string;
  git: ReturnType<typeof simpleGit>;
  
  constructor(repoPath: string, outputPath: string) {
    this.repoPath = repoPath;
    this.outputPath = outputPath;
    this.git = simpleGit(repoPath);
  }
  
  /**
   * Clone a repository if it doesn't exist
   */
  async cloneRepository(repoUrl: string, branch = 'main'): Promise<void> {
    if (!fs.existsSync(this.repoPath)) {
      console.log(`Cloning repository: ${repoUrl}`);
      await this.git.clone(repoUrl, this.repoPath, ['--branch', branch]);
      console.log('Repository cloned successfully');
    } else {
      console.log('Repository already exists, skipping clone');
    }
  }
  
  /**
   * Analyze the repository structure
   */
  async analyzeStructure(): Promise<any> {
    console.log('Analyzing repository structure...');
    
    // Get all files in the repository
    const pattern = '**/*';
    const options = { 
      cwd: this.repoPath, 
      ignore: ['**/node_modules/**', '**/.git/**'] 
    };
    
    const files = await glob(pattern, options);
    
    // Analyze file extensions
    const extensions = this.analyzeFileExtensions(files);
    
    // Analyze directory structure
    const directoryStructure = this.analyzeDirectoryStructure(files);
    
    // Detect frameworks and technologies
    const technologies = await this.detectTechnologies();
    
    // Detect domain concepts
    const domainConcepts = this.detectDomainConcepts(files);
    
    const analysisResult = {
      repoPath: this.repoPath,
      fileCount: files.length,
      extensions,
      directoryStructure,
      technologies,
      domainConcepts
    };
    
    // Save analysis results
    await this.saveAnalysisResults(analysisResult);
    
    return analysisResult;
  }
  
  /**
   * Analyze file extensions to determine languages used
   */
  private analyzeFileExtensions(files: string[]): Record<string, number> {
    const extensions: Record<string, number> = {};
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext) {
        extensions[ext] = (extensions[ext] || 0) + 1;
      }
    }
    
    return extensions;
  }
  
  /**
   * Analyze directory structure
   */
  private analyzeDirectoryStructure(files: string[]): Record<string, number> {
    const directories: Record<string, number> = {};
    
    for (const file of files) {
      const dir = path.dirname(file);
      const parts = dir.split(path.sep);
      
      let currentPath = '';
      for (const part of parts) {
        if (part === '.') continue;
        
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        directories[currentPath] = (directories[currentPath] || 0) + 1;
      }
    }
    
    return directories;
  }
  
  /**
   * Detect frameworks and technologies used
   */
  private async detectTechnologies(): Promise<Record<string, boolean>> {
    const technologies: Record<string, boolean> = {};
    const packageJsonPath = path.join(this.repoPath, 'package.json');
    
    // Check for Node.js/JavaScript project
    if (fs.existsSync(packageJsonPath)) {
      technologies.nodejs = true;
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      
      // Check for common frameworks
      technologies.react = 'react' in allDeps;
      technologies.vue = 'vue' in allDeps;
      technologies.angular = '@angular/core' in allDeps;
      technologies.express = 'express' in allDeps;
      technologies.next = 'next' in allDeps;
      technologies.typescript = 'typescript' in allDeps || fs.existsSync(path.join(this.repoPath, 'tsconfig.json'));
    }
    
    // Check for Python project
    technologies.python = fs.existsSync(path.join(this.repoPath, 'requirements.txt')) ||
                          fs.existsSync(path.join(this.repoPath, 'setup.py')) ||
                          fs.existsSync(path.join(this.repoPath, 'pyproject.toml'));
    
    // Check for Java project
    technologies.java = fs.existsSync(path.join(this.repoPath, 'pom.xml')) ||
                        fs.existsSync(path.join(this.repoPath, 'build.gradle'));
    
    return technologies;
  }
  
  /**
   * Detect domain concepts based on file names and contents
   */
  private detectDomainConcepts(files: string[]): string[] {
    const concepts = new Set<string>();
    const domainPatterns = [
      // Common domain patterns to look for in filenames
      { pattern: /user|account|profile/i, concept: 'user-management' },
      { pattern: /auth|login|register|password/i, concept: 'authentication' },
      { pattern: /product|item|inventory/i, concept: 'e-commerce' },
      { pattern: /patient|medical|health/i, concept: 'healthcare' },
      { pattern: /invoice|payment|transaction/i, concept: 'finance' },
      { pattern: /blog|post|article|comment/i, concept: 'content-management' },
      { pattern: /student|course|class|lesson/i, concept: 'education' },
      { pattern: /monitor|sensor|device/i, concept: 'iot' },
      { pattern: /ticket|support|issue/i, concept: 'customer-support' }
    ];
    
    for (const file of files) {
      // Look for domain patterns in file names
      for (const { pattern, concept } of domainPatterns) {
        if (pattern.test(file)) {
          concepts.add(concept);
        }
      }
    }
    
    return Array.from(concepts);
  }
  
  /**
   * Save analysis results to output path
   */
  private async saveAnalysisResults(results: any): Promise<void> {
    const outputFilePath = path.join(this.outputPath, 'analysis-results.json');
    
    // Ensure output directory exists
    await fs.ensureDir(this.outputPath);
    
    // Write analysis results
    await fs.writeJson(outputFilePath, results, { spaces: 2 });
    
    console.log(`Analysis results saved to: ${outputFilePath}`);
  }
}

/**
 * Main function to run the repository analyzer
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: analyze-repo.ts <repo-path-or-url> [output-path] [branch]');
    process.exit(1);
  }
  
  const repoPathOrUrl = args[0];
  const outputPath = args[1] || './analysis-output';
  const branch = args[2] || 'main';
  
  let repoPath = repoPathOrUrl;
  
  // Check if it's a URL or a local path
  if (repoPathOrUrl.startsWith('http://') || repoPathOrUrl.startsWith('https://') || repoPathOrUrl.startsWith('git@')) {
    // It's a URL, so extract the repo name for the local path
    const repoName = repoPathOrUrl.split('/').pop()?.replace('.git', '') || 'repo';
    repoPath = path.join(process.cwd(), 'tmp', repoName);
    
    const analyzer = new RepositoryAnalyzer(repoPath, outputPath);
    await analyzer.cloneRepository(repoPathOrUrl, branch);
  }
  
  // Create analyzer and analyze the repository
  const analyzer = new RepositoryAnalyzer(repoPath, outputPath);
  const results = await analyzer.analyzeStructure();
  
  console.log('Analysis complete!');
  console.log(`Found ${results.fileCount} files with ${Object.keys(results.extensions).length} different extensions`);
  console.log(`Detected technologies: ${Object.keys(results.technologies).filter(t => results.technologies[t]).join(', ')}`);
  console.log(`Detected domain concepts: ${results.domainConcepts.join(', ')}`);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

export { RepositoryAnalyzer }; 