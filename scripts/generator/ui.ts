#!/usr/bin/env tsx

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execPromise = promisify(exec);

/**
 * Command-line interface for the repository generator
 */
class GeneratorCLI {
  rl: readline.Interface;
  
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  
  /**
   * Start the CLI
   */
  async start(): Promise<void> {
    console.log('🚀 Meta Assistant Generator CLI');
    console.log('===============================');
    console.log('This tool helps you analyze and transform repositories.');
    
    await this.showMainMenu();
  }
  
  /**
   * Display the main menu
   */
  private async showMainMenu(): Promise<void> {
    console.log('\n📋 Main Menu:');
    console.log('1. Analyze Repository');
    console.log('2. Transform Repository');
    console.log('3. Generate Domain Configuration');
    console.log('4. Exit');
    
    const choice = await this.question('Enter your choice (1-4): ');
    
    switch (choice) {
      case '1':
        await this.handleAnalyzeRepository();
        break;
      case '2':
        await this.handleTransformRepository();
        break;
      case '3':
        await this.handleGenerateConfig();
        break;
      case '4':
        this.exit('Goodbye! 👋');
        break;
      default:
        console.log('Invalid choice. Please try again.');
        await this.showMainMenu();
        break;
    }
  }
  
  /**
   * Handle repository analysis
   */
  private async handleAnalyzeRepository(): Promise<void> {
    console.log('\n🔍 Analyze Repository:');
    
    const repoPath = await this.question('Enter repository path or URL: ');
    const outputPath = await this.question('Enter output path (default: ./analysis-output): ') || './analysis-output';
    
    try {
      console.log('\nAnalyzing repository...');
      
      const command = `tsx scripts/generator/analyze-repo.ts "${repoPath}" "${outputPath}"`;
      const { stdout, stderr } = await execPromise(command);
      
      console.log(stdout);
      
      if (stderr) {
        console.error('Errors:', stderr);
      }
      
      console.log('\n✅ Analysis complete!');
    } catch (error) {
      console.error('Error analyzing repository:', error);
    }
    
    await this.showMainMenu();
  }
  
  /**
   * Handle repository transformation
   */
  private async handleTransformRepository(): Promise<void> {
    console.log('\n🔄 Transform Repository:');
    
    const sourceRepoPath = await this.question('Enter source repository path: ');
    
    // Check if the repository exists
    if (!fs.existsSync(sourceRepoPath)) {
      console.error(`Error: Repository not found at ${sourceRepoPath}`);
      await this.showMainMenu();
      return;
    }
    
    // List available domain configurations
    const configPath = './scripts/generator/config';
    await fs.ensureDir(configPath);
    
    const configFiles = fs.readdirSync(configPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    
    if (configFiles.length === 0) {
      console.log('No domain configurations found. Please create one first.');
      await this.showMainMenu();
      return;
    }
    
    console.log('\nAvailable domains:');
    configFiles.forEach((domain, index) => {
      console.log(`${index + 1}. ${domain}`);
    });
    
    const domainChoice = await this.question(`Enter domain number (1-${configFiles.length}): `);
    const domainIndex = parseInt(domainChoice) - 1;
    
    if (isNaN(domainIndex) || domainIndex < 0 || domainIndex >= configFiles.length) {
      console.error('Invalid domain choice.');
      await this.showMainMenu();
      return;
    }
    
    const targetDomain = configFiles[domainIndex];
    const targetPath = await this.question(`Enter target path (default: ./generated/${targetDomain}-repo): `) || 
      `./generated/${targetDomain}-repo`;
    
    try {
      console.log('\nTransforming repository...');
      
      const command = `tsx scripts/generator/transform-repo.ts "${sourceRepoPath}" "${targetDomain}" "${targetPath}"`;
      const { stdout, stderr } = await execPromise(command);
      
      console.log(stdout);
      
      if (stderr) {
        console.error('Errors:', stderr);
      }
      
      console.log('\n✅ Transformation complete!');
    } catch (error) {
      console.error('Error transforming repository:', error);
    }
    
    await this.showMainMenu();
  }
  
  /**
   * Handle domain configuration generation
   */
  private async handleGenerateConfig(): Promise<void> {
    console.log('\n⚙️ Generate Domain Configuration:');
    
    const domainName = await this.question('Enter domain name: ');
    
    if (!domainName) {
      console.error('Domain name is required.');
      await this.showMainMenu();
      return;
    }
    
    const configPath = './scripts/generator/config';
    await fs.ensureDir(configPath);
    
    const configFile = path.join(configPath, `${domainName}.json`);
    
    // Create a basic configuration template
    const config = {
      domain: domainName,
      entityMapping: {
        'OriginalEntity': `${domainName.charAt(0).toUpperCase() + domainName.slice(1)}Entity`
      },
      fileMapping: {
        'src/original.ts': `src/${domainName.toLowerCase()}.ts`
      },
      excludePaths: [
        'node_modules',
        '.git',
        'dist',
        'build'
      ],
      customTransformations: [
        {
          pattern: 'originalPattern',
          replacement: `${domainName}Pattern`,
          flags: 'g'
        }
      ]
    };
    
    try {
      await fs.writeJson(configFile, config, { spaces: 2 });
      console.log(`\n✅ Configuration file created: ${configFile}`);
      console.log('Please edit this file to customize your transformation rules.');
    } catch (error) {
      console.error('Error creating configuration file:', error);
    }
    
    await this.showMainMenu();
  }
  
  /**
   * Ask a question and get user input
   */
  private question(prompt: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(prompt, answer => {
        resolve(answer.trim());
      });
    });
  }
  
  /**
   * Exit the CLI
   */
  private exit(message: string): void {
    console.log(message);
    this.rl.close();
    process.exit(0);
  }
}

/**
 * Main function to run the CLI
 */
async function main() {
  const cli = new GeneratorCLI();
  await cli.start();
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

export { GeneratorCLI }; 