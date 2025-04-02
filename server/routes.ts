import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertProjectSchema, insertModelDefinitionSchema, Message } from "@shared/schema";
import { aiService } from "./services/aiService";
import { generateCode } from "./services/codeGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Get all projects for a user
  apiRouter.get("/projects", async (req, res) => {
    try {
      // In a real app, we'd get the userId from auth
      const userId = 1; // Using demo user for now
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get a specific project
  apiRouter.get("/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create a new project
  apiRouter.post("/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const newProject = await storage.createProject(validatedData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update a project
  apiRouter.put("/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(projectId, validatedData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Delete a project
  apiRouter.delete("/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const success = await storage.deleteProject(projectId);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Get all model definitions for a project
  apiRouter.get("/projects/:projectId/models", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const models = await storage.getModelDefinitionsByProjectId(projectId);
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  // Get a specific model definition
  apiRouter.get("/models/:id", async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.getModelDefinition(modelId);
      if (!model) {
        return res.status(404).json({ message: "Model definition not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch model definition" });
    }
  });

  // Create a new model definition
  apiRouter.post("/models", async (req, res) => {
    try {
      const validatedData = insertModelDefinitionSchema.parse(req.body);
      const newModel = await storage.createModelDefinition(validatedData);
      res.status(201).json(newModel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid model data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create model definition" });
    }
  });

  // Update a model definition
  apiRouter.put("/models/:id", async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const validatedData = insertModelDefinitionSchema.partial().parse(req.body);
      const updatedModel = await storage.updateModelDefinition(modelId, validatedData);
      if (!updatedModel) {
        return res.status(404).json({ message: "Model definition not found" });
      }
      res.json(updatedModel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid model data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update model definition" });
    }
  });

  // Get AI conversation for a project
  apiRouter.get("/projects/:projectId/conversation", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const conversation = await storage.getAiConversationByProjectId(projectId);
      if (!conversation) {
        // Create a new conversation if none exists
        const newConversation = await storage.createAiConversation({
          projectId,
          messages: []
        });
        return res.json(newConversation);
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Send a message to the AI assistant
  apiRouter.post("/projects/:projectId/conversation", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userMessage = req.body.message as string;
      
      if (!userMessage) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get the current conversation or create one
      let conversation = await storage.getAiConversationByProjectId(projectId);
      
      // Get the project's current model definition if available
      const models = await storage.getModelDefinitionsByProjectId(projectId);
      const projectModel = models.length > 0 ? models[0] : null;
      
      if (!conversation) {
        conversation = await storage.createAiConversation({
          projectId,
          messages: []
        });
      }

      // Add the user message
      const userMessageObj: Message = {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      
      const messages = [...conversation.messages, userMessageObj];

      // Store the updated conversation
      await storage.updateAiConversation(conversation.id, messages);

      // Get response from AI service
      const aiResponse = await aiService.generateResponse(userMessage, projectModel);
      
      // Add the AI response to the conversation
      const aiMessageObj: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, aiMessageObj];
      
      // Store the final conversation with AI response
      const updatedConversation = await storage.updateAiConversation(conversation.id, updatedMessages);
      
      res.json(updatedConversation);
    } catch (error) {
      console.error("AI conversation error:", error);
      res.status(500).json({ message: "Failed to process conversation" });
    }
  });

  // Generate code from a model definition
  apiRouter.post("/models/:id/generate", async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.getModelDefinition(modelId);
      
      if (!model) {
        return res.status(404).json({ message: "Model definition not found" });
      }

      // Generate code based on the model definition
      const generatedFiles = await generateCode(model);
      
      // Store generated code
      const storedFiles = await Promise.all(generatedFiles.map(file => 
        storage.createGeneratedCode({
          projectId: model.projectId,
          modelId: model.id,
          code: file.content,
          path: file.path
        })
      ));
      
      res.json({ files: storedFiles });
    } catch (error) {
      console.error("Code generation error:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });

  // Get generated code files for a project
  apiRouter.get("/projects/:projectId/generated", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const files = await storage.getGeneratedCodeByProjectId(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch generated code" });
    }
  });

  // Register API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
