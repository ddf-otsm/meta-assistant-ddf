import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { createRotatingLogger } from '../config/log-rotation.js';
import documentationService from '../services/documentationService.js';

const logger = createRotatingLogger('documentation-routes');
const router = Router();

// Route to get documentation for a specific project
router.get('/projects/:projectId/documentation', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    logger.info(`Documentation requested for project ${projectId}`);
    
    // Determine project name (in a real implementation, you would query the database)
    let projectName = 'baby-monitor';
    
    // Get the documentation structure using our service
    const documentation = await documentationService.getDocumentationStructure(projectName);
    
    if (!documentation) {
      return res.status(404).json({ 
        error: 'Documentation not found for this project' 
      });
    }
    
    return res.status(200).json({ 
      projectId: parseInt(projectId), 
      projectName: documentation.projectName, 
      files: documentation.files 
    });
  } catch (error) {
    logger.error('Error retrieving documentation:', error);
    return res.status(500).json({ 
      error: 'Internal server error retrieving documentation' 
    });
  }
});

// Route to organize documentation for a project
router.post('/projects/:projectId/documentation/organize', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sourcePath, projectName } = req.body;
    
    if (!sourcePath || !projectName) {
      return res.status(400).json({ 
        error: 'Source path and project name are required' 
      });
    }
    
    logger.info(`Organizing documentation for project ${projectId} from ${sourcePath}`);
    
    // Use the service to organize documentation
    const exportPath = await documentationService.organizeProjectDocumentation(
      projectName,
      sourcePath
    );
    
    return res.status(200).json({ 
      success: true,
      projectId: parseInt(projectId),
      projectName,
      exportPath
    });
  } catch (error) {
    logger.error('Error organizing documentation:', error);
    return res.status(500).json({ 
      error: 'Internal server error organizing documentation' 
    });
  }
});

export default router; 