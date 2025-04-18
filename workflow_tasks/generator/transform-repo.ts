#!/usr/bin/env tsx

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import Handlebars from 'handlebars';
import glob from 'glob';
import { RepositoryAnalyzer } from './analyze-repo';

/**
 * Transforms a repository into a different domain
 */
class RepositoryTransformer {
  sourceRepoPath: string;
  targetRepoPath: string;
  templatesPath: string;
  configPath: string;
  
  constructor(sourceRepoPath: string, targetRepoPath: string, templatesPath: string, configPath: string) {
    this.sourceRepoPath = sourceRepoPath;
    this.targetRepoPath = targetRepoPath;
    this.templatesPath = templatesPath;
    this.configPath = configPath;
  }
  
  /**
   * Run the transformation process
   */
  async transform(targetDomain: string, options: TransformOptions = {}): Promise<void> {
    console.log(`Transforming repository to ${targetDomain} domain...`);
    
    // Load transformation config
    const config = await this.loadConfig(targetDomain);
    
    // Create target directory if it doesn't exist
    await fs.ensureDir(this.targetRepoPath);
    
    // Copy source files to target
    if (!options.skipCopy) {
      await this.copySourceFiles(config.excludePaths || []);
    }
    
    // Apply transformations
    await this.applyTransformations(config, targetDomain);
    
    // Generate new files from templates
    await this.generateFromTemplates(config, targetDomain);
    
    console.log('Transformation complete!');
  }
  
  /**
   * Load the transformation configuration
   */
  private async loadConfig(targetDomain: string): Promise<TransformationConfig> {
    const configFile = path.join(this.configPath, `${targetDomain}.json`);
    
    if (!fs.existsSync(configFile)) {
      throw new Error(`Configuration file not found for domain: ${targetDomain}`);
    }
    
    return fs.readJson(configFile);
  }
  
  /**
   * Copy source files to target directory, excluding specified paths
   */
  private async copySourceFiles(excludePaths: string[]): Promise<void> {
    console.log('Copying source files to target directory...');
    
    const options = {
      filter: (src: string) => {
        const relativePath = path.relative(this.sourceRepoPath, src);
        
        // Skip excluded paths
        for (const excludePath of excludePaths) {
          if (relativePath.startsWith(excludePath)) {
            return false;
          }
        }
        
        // Skip node_modules, .git, etc.
        return !src.includes('node_modules') && 
               !src.includes('.git') && 
               !src.includes('dist') &&
               !src.includes('build');
      }
    };
    
    await fs.copy(this.sourceRepoPath, this.targetRepoPath, options);
  }
  
  /**
   * Apply transformations to the copied files
   */
  private async applyTransformations(config: TransformationConfig, targetDomain: string): Promise<void> {
    console.log('Applying transformations...');
    
    // Apply file renaming
    await this.renameFiles(config.fileMapping || {});
    
    // Apply content transformations
    await this.transformFileContents(config, targetDomain);
  }
  
  /**
   * Rename files according to mapping
   */
  private async renameFiles(fileMapping: Record<string, string>): Promise<void> {
    for (const [sourcePath, targetPath] of Object.entries(fileMapping)) {
      const fullSourcePath = path.join(this.targetRepoPath, sourcePath);
      const fullTargetPath = path.join(this.targetRepoPath, targetPath);
      
      if (fs.existsSync(fullSourcePath)) {
        console.log(`Renaming: ${sourcePath} -> ${targetPath}`);
        
        // Ensure target directory exists
        await fs.ensureDir(path.dirname(fullTargetPath));
        
        // Move the file
        await fs.move(fullSourcePath, fullTargetPath, { overwrite: true });
      }
    }
  }
  
  /**
   * Transform file contents according to the configuration
   */
  private async transformFileContents(config: TransformationConfig, targetDomain: string): Promise<void> {
    const pattern = '**/*.{js,jsx,ts,tsx,html,css,md,json}';
    const options = { 
      cwd: this.targetRepoPath, 
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'] 
    };
    
    const files = await glob(pattern, options);
    
    for (const file of files) {
      const fullPath = path.join(this.targetRepoPath, file);
      
      try {
        // Read file content
        let content = await fs.readFile(fullPath, 'utf8');
        
        // Apply transformations
        let transformed = false;
        
        // Apply entity name transformations
        if (config.entityMapping) {
          for (const [source, target] of Object.entries(config.entityMapping)) {
            const sourceRegex = new RegExp(`\\b${source}\\b`, 'g');
            if (sourceRegex.test(content)) {
              content = content.replace(sourceRegex, target);
              transformed = true;
            }
            
            // Also try lowercase version
            const sourceLower = source.toLowerCase();
            const targetLower = target.toLowerCase();
            const sourceLowerRegex = new RegExp(`\\b${sourceLower}\\b`, 'g');
            
            if (sourceLowerRegex.test(content)) {
              content = content.replace(sourceLowerRegex, targetLower);
              transformed = true;
            }
          }
        }
        
        // Apply custom transformations
        if (config.customTransformations) {
          for (const transform of config.customTransformations) {
            const pattern = new RegExp(transform.pattern, transform.flags || 'g');
            
            if (pattern.test(content)) {
              content = content.replace(pattern, transform.replacement);
              transformed = true;
            }
          }
        }
        
        // Save the transformed content
        if (transformed) {
          await fs.writeFile(fullPath, content, 'utf8');
          console.log(`Transformed: ${file}`);
        }
      } catch (error) {
        console.error(`Error transforming file ${file}:`, error);
      }
    }
  }
  
  /**
   * Generate new files from templates
   */
  private async generateFromTemplates(config: TransformationConfig, targetDomain: string): Promise<void> {
    console.log('Generating files from templates...');
    
    const domainTemplatesPath = path.join(this.templatesPath, targetDomain);
    
    if (!fs.existsSync(domainTemplatesPath)) {
      console.log(`No templates found for domain: ${targetDomain}`);
      return;
    }
    
    const templatePattern = '**/*.{hbs,handlebars,template}';
    const options = { cwd: domainTemplatesPath };
    
    const templateFiles = await glob(templatePattern, options);
    
    for (const templateFile of templateFiles) {
      const fullTemplatePath = path.join(domainTemplatesPath, templateFile);
      
      // Determine output file path - remove .hbs/.handlebars/.template extension
      const outputFile = templateFile
        .replace(/\.hbs$/, '')
        .replace(/\.handlebars$/, '')
        .replace(/\.template$/, '');
        
      const fullOutputPath = path.join(this.targetRepoPath, outputFile);
      
      try {
        // Read template content
        const templateContent = await fs.readFile(fullTemplatePath, 'utf8');
        
        // Compile template
        const template = Handlebars.compile(templateContent);
        
        // Execute template with config data
        const result = template({
          domain: targetDomain,
          config,
          timestamp: new Date().toISOString()
        });
        
        // Ensure output directory exists
        await fs.ensureDir(path.dirname(fullOutputPath));
        
        // Write output file
        await fs.writeFile(fullOutputPath, result, 'utf8');
        console.log(`Generated: ${outputFile}`);
      } catch (error) {
        console.error(`Error generating file from template ${templateFile}:`, error);
      }
    }
  }
}

interface TransformOptions {
  skipCopy?: boolean;
}

interface TransformationConfig {
  entityMapping?: Record<string, string>;
  fileMapping?: Record<string, string>;
  excludePaths?: string[];
  customTransformations?: Array<{
    pattern: string;
    replacement: string;
    flags?: string;
  }>;
  [key: string]: any;
}

/**
 * Main function to run the repository transformer
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: transform-repo.ts <source-repo-path> <target-domain> [target-path] [templates-path] [config-path]');
    process.exit(1);
  }
  
  const sourceRepoPath = args[0];
  const targetDomain = args[1];
  const targetPath = args[2] || `./generated/${targetDomain}-repo`;
  const templatesPath = args[3] || './scripts/generator/templates';
  const configPath = args[4] || './scripts/generator/config';
  
  // Create transformer and run transformation
  const transformer = new RepositoryTransformer(
    sourceRepoPath,
    targetPath,
    templatesPath,
    configPath
  );
  
  await transformer.transform(targetDomain);
  
  console.log(`Transformation complete! Output directory: ${targetPath}`);
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { RepositoryTransformer }; 