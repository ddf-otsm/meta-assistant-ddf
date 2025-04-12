import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createRotatingLogger } from '../config/log-rotation.js';

const execAsync = promisify(exec);
const logger = createRotatingLogger('documentation-service');

interface DocumentationFile {
  path: string;
  name: string;
  content: string;
  isDirectory: boolean;
  children?: DocumentationFile[];
}

interface DocumentationStructure {
  projectName: string;
  files: DocumentationFile[];
}

/**
 * Service for organizing project documentation
 */
class DocumentationService {
  private exportBasePath: string;
  
  constructor() {
    this.exportBasePath = path.join(process.cwd(), 'export');
    this.ensureExportDirectoryExists();
  }
  
  /**
   * Ensure the export directory exists
   */
  private ensureExportDirectoryExists(): void {
    if (!fs.existsSync(this.exportBasePath)) {
      fs.mkdirSync(this.exportBasePath, { recursive: true });
      logger.info(`Created export directory at ${this.exportBasePath}`);
    }
  }
  
  /**
   * Create organized documentation structure for a project
   */
  public async organizeProjectDocumentation(projectName: string, sourcePath: string): Promise<string> {
    try {
      const projectExportPath = path.join(this.exportBasePath, projectName);
      
      // Create project directory if it doesn't exist
      if (!fs.existsSync(projectExportPath)) {
        fs.mkdirSync(projectExportPath, { recursive: true });
        fs.mkdirSync(path.join(projectExportPath, 'docs'), { recursive: true });
        fs.mkdirSync(path.join(projectExportPath, 'docs', 'architecture'), { recursive: true });
        fs.mkdirSync(path.join(projectExportPath, 'docs', 'implementations'), { recursive: true });
        fs.mkdirSync(path.join(projectExportPath, 'docs', 'plans'), { recursive: true });
        fs.mkdirSync(path.join(projectExportPath, 'docs', 'generators'), { recursive: true });
      }
      
      // Create README if it doesn't exist
      const readmePath = path.join(projectExportPath, 'README.md');
      if (!fs.existsSync(readmePath)) {
        const readmeContent = `# ${projectName} Documentation\n\nThis directory contains the documentation for the ${projectName} project.\n\n## Directory Structure\n\n- docs/: Detailed documentation and plans\n  - architecture/: System design and architecture documentation\n  - implementations/: Specific implementation examples and guides\n  - plans/: Transformation and execution plans\n  - generators/: Generator implementation details\n`;
        fs.writeFileSync(readmePath, readmeContent);
      }
      
      // Copy and organize documentation from source path
      if (fs.existsSync(sourcePath)) {
        const stats = fs.statSync(sourcePath);
        if (stats.isDirectory()) {
          await this.copyAndOrganizeDirectory(sourcePath, projectExportPath);
        } else if (stats.isFile()) {
          await this.copyAndCategorizeFile(sourcePath, projectExportPath);
        }
      }
      
      logger.info(`Documentation for project ${projectName} organized at ${projectExportPath}`);
      return projectExportPath;
    } catch (error) {
      logger.error(`Error organizing documentation for ${projectName}:`, error);
      throw new Error(`Failed to organize documentation: ${error}`);
    }
  }
  
  /**
   * Copy and organize a directory of documentation files
   */
  private async copyAndOrganizeDirectory(sourcePath: string, projectExportPath: string): Promise<void> {
    try {
      const files = await fs.promises.readdir(sourcePath);
      
      for (const file of files) {
        const filePath = path.join(sourcePath, file);
        const stats = await fs.promises.stat(filePath);
        
        if (stats.isDirectory()) {
          await this.copyAndOrganizeDirectory(filePath, projectExportPath);
        } else {
          await this.copyAndCategorizeFile(filePath, projectExportPath);
        }
      }
    } catch (error) {
      logger.error(`Error copying directory ${sourcePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Copy a file to the appropriate documentation category
   */
  private async copyAndCategorizeFile(filePath: string, projectExportPath: string): Promise<void> {
    try {
      // Only process markdown files
      if (!filePath.endsWith('.md')) {
        return;
      }
      
      const fileName = path.basename(filePath);
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      
      // Determine the appropriate category based on file content and name
      let category = 'plans';
      
      if (fileName.toLowerCase().includes('architecture') || 
          fileContent.toLowerCase().includes('architecture') ||
          fileContent.toLowerCase().includes('system design')) {
        category = 'architecture';
      } else if (fileName.toLowerCase().includes('implement') || 
                 fileContent.toLowerCase().includes('implement')) {
        category = 'implementations';
      } else if (fileName.toLowerCase().includes('generat') || 
                 fileContent.toLowerCase().includes('generat')) {
        category = 'generators';
      }
      
      // Copy the file to the appropriate category
      const destPath = path.join(projectExportPath, 'docs', category, fileName);
      await fs.promises.copyFile(filePath, destPath);
      logger.info(`Copied ${filePath} to ${destPath}`);
    } catch (error) {
      logger.error(`Error categorizing file ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Get documentation structure for a project
   */
  public async getDocumentationStructure(projectName: string): Promise<DocumentationStructure | null> {
    try {
      const projectPath = path.join(this.exportBasePath, projectName);
      
      if (!fs.existsSync(projectPath)) {
        logger.warn(`Project documentation not found for ${projectName}`);
        return null;
      }
      
      // Read the documentation directory structure
      const files = await this.readDirectory(projectPath);
      
      return {
        projectName,
        files
      };
    } catch (error) {
      logger.error(`Error getting documentation structure for ${projectName}:`, error);
      return null;
    }
  }
  
  /**
   * Recursively read a directory structure
   */
  private async readDirectory(dirPath: string): Promise<DocumentationFile[]> {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const result = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          const isDirectory = entry.isDirectory();
          
          // Create base file entry
          const fileEntry: DocumentationFile = {
            path: fullPath,
            name: entry.name,
            isDirectory,
            content: '',
            children: []
          };
          
          if (isDirectory) {
            // Read child entries recursively
            fileEntry.children = await this.readDirectory(fullPath);
          } else {
            // Only read MD files or README files for optimization
            if (entry.name.endsWith('.md') || entry.name === 'README.md') {
              try {
                fileEntry.content = await fs.promises.readFile(fullPath, 'utf-8');
              } catch (err) {
                logger.error(`Error reading file ${fullPath}:`, err);
                fileEntry.content = 'Error reading file content';
              }
            }
          }
          
          return fileEntry;
        })
      );
      
      return result;
    } catch (err) {
      logger.error(`Error reading directory ${dirPath}:`, err);
      return [];
    }
  }
}

export default new DocumentationService(); 