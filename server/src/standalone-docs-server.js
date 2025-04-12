import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log("Project root:", projectRoot);
console.log("Export path:", path.join(projectRoot, 'export'));

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to recursively read a directory
const readDirectory = async (dirPath) => {
  try {
    console.log(`Reading directory: ${dirPath}`);
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const result = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const isDirectory = entry.isDirectory();
        
        // Create base file entry
        const fileEntry = {
          path: fullPath,
          name: entry.name,
          isDirectory,
          content: '',
          children: []
        };
        
        if (isDirectory) {
          // Read child entries recursively
          fileEntry.children = await readDirectory(fullPath);
        } else {
          // Only read MD files or README files for optimization
          if (entry.name.endsWith('.md') || entry.name === 'README.md') {
            try {
              fileEntry.content = await fs.promises.readFile(fullPath, 'utf-8');
            } catch (err) {
              console.error(`Error reading file ${fullPath}:`, err);
              fileEntry.content = 'Error reading file content';
            }
          }
        }
        
        return fileEntry;
      })
    );
    
    return result;
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    return [];
  }
};

// Documentation endpoint
app.get('/api/projects/:projectId/documentation', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    console.log(`Documentation requested for project ${projectId}`);
    
    // We'll just use baby-monitor as an example
    const projectName = 'baby-monitor';
    
    const documentationPath = path.join(projectRoot, 'export', projectName);
    
    if (!fs.existsSync(documentationPath)) {
      console.warn(`Documentation path not found: ${documentationPath}`);
      return res.status(404).json({ 
        error: 'Documentation not found for this project' 
      });
    }
    
    // Read the documentation directory structure
    const files = await readDirectory(documentationPath);
    
    return res.status(200).json({ 
      projectId: parseInt(projectId), 
      projectName,
      files 
    });
  } catch (error) {
    console.error('Error retrieving documentation:', error);
    return res.status(500).json({ 
      error: 'Internal server error retrieving documentation' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Documentation server is running on port ${port}`);
}); 