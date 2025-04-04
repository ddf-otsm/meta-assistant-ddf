import { createServer, type Server } from 'http';

import express, { type Express } from 'express';
import { z } from 'zod';

import {
  insertProjectSchema,
  insertModelDefinitionSchema,
  Message,
} from '@shared/schema';

import { aiService } from './services/aiService';
import { generateCode } from './services/codeGenerator';
import { storage } from './storage';

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Get all projects for a user
  apiRouter.get('/projects', async (req, res) => {
    try {
      // In a real app, we'd get the userId from auth
      const userId = 1; // Using demo user for now
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  // Get a specific project
  apiRouter.get('/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  // Create a new project
  apiRouter.post('/projects', async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const newProject = await storage.createProject(validatedData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  // Update a project
  apiRouter.put('/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(projectId, validatedData);
      if (!updatedProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  // Delete a project
  apiRouter.delete('/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const success = await storage.deleteProject(projectId);
      if (!success) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // Get all model definitions for a project
  apiRouter.get('/projects/:projectId/models', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const models = await storage.getModelDefinitionsByProjectId(projectId);
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch models' });
    }
  });

  // Get a specific model definition
  apiRouter.get('/models/:id', async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.getModelDefinition(modelId);
      if (!model) {
        return res.status(404).json({ message: 'Model definition not found' });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch model definition' });
    }
  });

  // Create a new model definition
  apiRouter.post('/models', async (req, res) => {
    try {
      const validatedData = insertModelDefinitionSchema.parse(req.body);
      const newModel = await storage.createModelDefinition(validatedData);
      res.status(201).json(newModel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid model data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create model definition' });
    }
  });

  // Update a model definition
  apiRouter.put('/models/:id', async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const validatedData = insertModelDefinitionSchema.partial().parse(req.body);
      const updatedModel = await storage.updateModelDefinition(modelId, validatedData);
      if (!updatedModel) {
        return res.status(404).json({ message: 'Model definition not found' });
      }
      res.json(updatedModel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid model data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update model definition' });
    }
  });

  // Get AI conversation for a project
  apiRouter.get('/projects/:projectId/conversation', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const conversation = await storage.getAiConversationByProjectId(projectId);
      if (!conversation) {
        // Create a new conversation if none exists
        const newConversation = await storage.createAiConversation({
          projectId,
          messages: [],
        });
        return res.json(newConversation);
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch conversation' });
    }
  });

  // Send a message to the AI assistant
  apiRouter.post('/projects/:projectId/conversation', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userMessage = req.body.message as string;

      if (!userMessage) {
        return res.status(400).json({ message: 'Message is required' });
      }

      // Get the current conversation or create one
      let conversation = await storage.getAiConversationByProjectId(projectId);

      // Get the project's current model definition if available
      const models = await storage.getModelDefinitionsByProjectId(projectId);
      const projectModel = models.length > 0 ? models[0] : null;

      if (!conversation) {
        conversation = await storage.createAiConversation({
          projectId,
          messages: [],
        });
      }

      // Add the user message
      const userMessageObj: Message = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };

      // Ensure conversation.messages is an array
      const existingMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
      const messages = [...existingMessages, userMessageObj];

      // Store the updated conversation
      await storage.updateAiConversation(conversation.id, messages);

      // Get response from AI service
      const aiResponse = await aiService.generateResponse(userMessage, projectModel);

      // Add the AI response to the conversation
      const aiMessageObj: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      // Ensure messages is an array
      const messagesArray = Array.isArray(messages) ? messages : [];
      const updatedMessages = [...messagesArray, aiMessageObj];

      // Store the final conversation with AI response
      const updatedConversation = await storage.updateAiConversation(
        conversation.id,
        updatedMessages
      );

      res.json(updatedConversation);
    } catch (error) {
      console.error('AI conversation error:', error);
      res.status(500).json({ message: 'Failed to process conversation' });
    }
  });

  // Generate code from a model definition
  apiRouter.post('/models/:id/generate', async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.getModelDefinition(modelId);

      if (!model) {
        return res.status(404).json({ message: 'Model definition not found' });
      }

      // Generate code based on the model definition
      const generatedFiles = await generateCode(model);

      // Store generated code
      const storedFiles = await Promise.all(
        generatedFiles.map(file =>
          storage.createGeneratedCode({
            projectId: model.projectId,
            modelId: model.id,
            code: file.content,
            path: file.path,
          })
        )
      );

      res.json({ files: storedFiles });
    } catch (error) {
      console.error('Code generation error:', error);
      res.status(500).json({ message: 'Failed to generate code' });
    }
  });

  // Get generated code files for a project
  apiRouter.get('/projects/:projectId/generated', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const files = await storage.getGeneratedCodeByProjectId(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch generated code' });
    }
  });

  // Meta-Software Engineering: Identify patterns in code or description
  apiRouter.post('/meta/identify-patterns', async (req, res) => {
    try {
      const { codeOrDescription } = req.body;

      if (!codeOrDescription) {
        return res.status(400).json({ message: 'Code or description text is required' });
      }

      const patterns = await aiService.identifyPatterns(codeOrDescription);
      res.json(patterns);
    } catch (error) {
      console.error('Pattern identification error:', error);
      res.status(500).json({ message: 'Failed to identify patterns' });
    }
  });

  // Meta-Software Engineering: Generate a metamodel based on patterns
  apiRouter.post('/meta/generate-metamodel', async (req, res) => {
    try {
      const { patterns, type } = req.body;

      if (!patterns || !Array.isArray(patterns) || !type) {
        return res.status(400).json({
          message: 'Valid patterns array and type are required',
          validTypes: ['component', 'page', 'form', 'workflow', 'api', 'report', 'custom'],
        });
      }

      const metamodel = await aiService.generateMetaModel(patterns, type);
      res.json(metamodel);
    } catch (error) {
      console.error('Metamodel generation error:', error);
      res.status(500).json({ message: 'Failed to generate metamodel' });
    }
  });

  // Meta-Software Engineering: Generate a code template from a metamodel
  apiRouter.post('/meta/generate-template', async (req, res) => {
    try {
      const { metamodel, language, templateType } = req.body;

      if (!metamodel || !language || !templateType) {
        return res.status(400).json({
          message: 'Metamodel, language, and template type are required',
        });
      }

      const template = await aiService.generateTemplate(metamodel, language, templateType);
      res.json(template);
    } catch (error) {
      console.error('Template generation error:', error);
      res.status(500).json({ message: 'Failed to generate template' });
    }
  });

  // Meta-Software Engineering: Generate a specification from a metamodel
  apiRouter.post('/meta/generate-specification', async (req, res) => {
    try {
      const { metamodel, requirements } = req.body;

      if (!metamodel || !requirements) {
        return res.status(400).json({
          message: 'Metamodel and requirements text are required',
        });
      }

      const specification = await aiService.generateSpecification(metamodel, requirements);
      res.json(specification);
    } catch (error) {
      console.error('Specification generation error:', error);
      res.status(500).json({ message: 'Failed to generate specification' });
    }
  });

  // Meta-Software Engineering: Design a code generator
  apiRouter.post('/meta/design-generator', async (req, res) => {
    try {
      const { framework, examples } = req.body;

      if (!framework || !examples || !Array.isArray(examples)) {
        return res.status(400).json({
          message: 'Framework definition and examples array are required',
        });
      }

      const generator = await aiService.designGenerator(framework, examples);
      res.json(generator);
    } catch (error) {
      console.error('Generator design error:', error);
      res.status(500).json({ message: 'Failed to design generator' });
    }
  });

  // Meta-Software Engineering: Refine generated code
  apiRouter.post('/meta/refine-code', async (req, res) => {
    try {
      const { code, requirements, feedback } = req.body;

      if (!code || !requirements) {
        return res.status(400).json({
          message: 'Code and requirements are required',
        });
      }

      const refinedCode = await aiService.refineGeneratedCode(code, requirements, feedback || null);
      res.json({ refinedCode });
    } catch (error) {
      console.error('Code refinement error:', error);
      res.status(500).json({ message: 'Failed to refine code' });
    }
  });

  // Meta-Software Engineering: Analyze a model definition
  apiRouter.post('/meta/analyze-model', async (req, res) => {
    try {
      const { modelId } = req.body;

      if (!modelId) {
        return res.status(400).json({ message: 'Model ID is required' });
      }

      const model = await storage.getModelDefinition(parseInt(modelId));

      if (!model) {
        return res.status(404).json({ message: 'Model definition not found' });
      }

      const analysis = await aiService.analyzeModelDefinition(model);
      res.json({ analysis });
    } catch (error) {
      console.error('Model analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze model' });
    }
  });

  // Register API routes
  app.use('/api', apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
