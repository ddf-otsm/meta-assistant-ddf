import {
  User,
  InsertUser,
  Project,
  InsertProject,
  ModelDefinition,
  InsertModelDefinition,
  Template,
  InsertTemplate,
  GeneratedCode,
  InsertGeneratedCode,
  AiConversation,
  InsertAiConversation,
  ApiSpecification,
  Message,
} from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Model Definition operations
  getModelDefinition(id: number): Promise<ModelDefinition | undefined>;
  getModelDefinitionsByProjectId(projectId: number): Promise<ModelDefinition[]>;
  createModelDefinition(modelDef: InsertModelDefinition): Promise<ModelDefinition>;
  updateModelDefinition(
    id: number,
    modelDef: Partial<InsertModelDefinition>
  ): Promise<ModelDefinition | undefined>;
  deleteModelDefinition(id: number): Promise<boolean>;

  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplatesByProjectId(projectId: number): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Generated Code operations
  getGeneratedCode(id: number): Promise<GeneratedCode | undefined>;
  getGeneratedCodeByProjectId(projectId: number): Promise<GeneratedCode[]>;
  createGeneratedCode(genCode: InsertGeneratedCode): Promise<GeneratedCode>;
  deleteGeneratedCode(id: number): Promise<boolean>;

  // AI Conversation operations
  getAiConversation(id: number): Promise<AiConversation | undefined>;
  getAiConversationByProjectId(projectId: number): Promise<AiConversation | undefined>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateAiConversation(id: number, messages: Message[]): Promise<AiConversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private modelDefinitions: Map<number, ModelDefinition>;
  private templates: Map<number, Template>;
  private generatedCode: Map<number, GeneratedCode>;
  private aiConversations: Map<number, AiConversation>;

  private userIdCounter: number;
  private projectIdCounter: number;
  private modelDefIdCounter: number;
  private templateIdCounter: number;
  private genCodeIdCounter: number;
  private aiConvIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.modelDefinitions = new Map();
    this.templates = new Map();
    this.generatedCode = new Map();
    this.aiConversations = new Map();

    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.modelDefIdCounter = 1;
    this.templateIdCounter = 1;
    this.genCodeIdCounter = 1;
    this.aiConvIdCounter = 1;

    // Initialize with a demo user and project
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: this.userIdCounter++,
      username: 'demo',
      password: 'password', // In a real app, this would be hashed
      displayName: 'Demo User',
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo project
    const demoProject: Project = {
      id: this.projectIdCounter++,
      name: 'Meta-API Generator',
      description: 'Build a generator that creates API endpoints from specifications',
      userId: demoUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(demoProject.id, demoProject);

    // Sample API specification model
    const apiSpec: ApiSpecification = {
      resource: {
        name: 'UserProfile',
        path: 'userProfiles',
        properties: [
          { name: 'id', type: 'string', required: true },
          { name: 'username', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'isActive', type: 'boolean', required: false },
        ],
        endpoints: [
          {
            method: 'GET',
            path: '/api/userProfiles',
            description: 'List all user profiles',
            pagination: true,
            filtering: true,
          },
          {
            method: 'GET',
            path: '/api/userProfiles/:id',
            description: 'Get a single user profile',
          },
          { method: 'POST', path: '/api/userProfiles', description: 'Create a new user profile' },
          {
            method: 'PUT',
            path: '/api/userProfiles/:id',
            description: 'Update an existing user profile',
          },
          { method: 'DELETE', path: '/api/userProfiles/:id', description: 'Delete a user profile' },
        ],
      },
      framework: {
        name: 'express',
        language: 'javascript',
      },
      features: {
        authentication: true,
        documentation: true,
        validation: true,
        testing: false,
        docker: false,
      },
    };

    // Create demo model definition
    const demoModelDef: ModelDefinition = {
      id: this.modelDefIdCounter++,
      name: 'UserProfileAPI',
      projectId: demoProject.id,
      definition: apiSpec,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.modelDefinitions.set(demoModelDef.id, demoModelDef);

    // Create demo AI conversation
    const demoConversation: AiConversation = {
      id: this.aiConvIdCounter++,
      projectId: demoProject.id,
      messages: [
        {
          role: 'assistant',
          content:
            "I've analyzed your API specification. Your UserProfile resource looks good, but consider adding these improvements:\n- Add data validation rules for email\n- Consider pagination for the GET all endpoint\n- Add sorting and filtering capabilities",
          timestamp: new Date(),
        },
        {
          role: 'user',
          content:
            'How would I implement pagination in Express.js? Can you generate that part for me?',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content:
            "Here's how to implement pagination in Express.js:\n```javascript\n// Pagination middleware\nconst paginate = (req, res, next) => {\n  const page = parseInt(req.query.page) || 1;\n  const limit = parseInt(req.query.limit) || 10;\n  const skip = (page - 1) * limit;\n  \n  req.pagination = { page, limit, skip };\n  next();\n};\n\n// In your route\nrouter.get('/api/userProfiles', paginate, async (req, res) => {\n  try {\n    const { skip, limit, page } = req.pagination;\n    \n    const profiles = await UserProfile.find()\n      .skip(skip)\n      .limit(limit);\n      \n    const total = await UserProfile.countDocuments();\n    \n    res.json({\n      data: profiles,\n      meta: {\n        total,\n        page,\n        pages: Math.ceil(total / limit)\n      }\n    });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n});\n```\nI'll add this to your generator template for the GET all endpoint.",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.aiConversations.set(demoConversation.id, demoConversation);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const newProject: Project = { ...project, id, createdAt: now, updatedAt: now };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;

    const updatedProject: Project = {
      ...existingProject,
      ...project,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Model Definition operations
  async getModelDefinition(id: number): Promise<ModelDefinition | undefined> {
    return this.modelDefinitions.get(id);
  }

  async getModelDefinitionsByProjectId(projectId: number): Promise<ModelDefinition[]> {
    return Array.from(this.modelDefinitions.values()).filter(
      modelDef => modelDef.projectId === projectId
    );
  }

  async createModelDefinition(modelDef: InsertModelDefinition): Promise<ModelDefinition> {
    const id = this.modelDefIdCounter++;
    const now = new Date();
    const newModelDef: ModelDefinition = { ...modelDef, id, createdAt: now, updatedAt: now };
    this.modelDefinitions.set(id, newModelDef);
    return newModelDef;
  }

  async updateModelDefinition(
    id: number,
    modelDef: Partial<InsertModelDefinition>
  ): Promise<ModelDefinition | undefined> {
    const existingModelDef = this.modelDefinitions.get(id);
    if (!existingModelDef) return undefined;

    const updatedModelDef: ModelDefinition = {
      ...existingModelDef,
      ...modelDef,
      updatedAt: new Date(),
    };
    this.modelDefinitions.set(id, updatedModelDef);
    return updatedModelDef;
  }

  async deleteModelDefinition(id: number): Promise<boolean> {
    return this.modelDefinitions.delete(id);
  }

  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getTemplatesByProjectId(projectId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.projectId === projectId);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.templateIdCounter++;
    const now = new Date();
    const newTemplate: Template = { ...template, id, createdAt: now, updatedAt: now };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(
    id: number,
    template: Partial<InsertTemplate>
  ): Promise<Template | undefined> {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) return undefined;

    const updatedTemplate: Template = {
      ...existingTemplate,
      ...template,
      updatedAt: new Date(),
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Generated Code operations
  async getGeneratedCode(id: number): Promise<GeneratedCode | undefined> {
    return this.generatedCode.get(id);
  }

  async getGeneratedCodeByProjectId(projectId: number): Promise<GeneratedCode[]> {
    return Array.from(this.generatedCode.values()).filter(
      genCode => genCode.projectId === projectId
    );
  }

  async createGeneratedCode(genCode: InsertGeneratedCode): Promise<GeneratedCode> {
    const id = this.genCodeIdCounter++;
    const newGenCode: GeneratedCode = { ...genCode, id, createdAt: new Date() };
    this.generatedCode.set(id, newGenCode);
    return newGenCode;
  }

  async deleteGeneratedCode(id: number): Promise<boolean> {
    return this.generatedCode.delete(id);
  }

  // AI Conversation operations
  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async getAiConversationByProjectId(projectId: number): Promise<AiConversation | undefined> {
    return Array.from(this.aiConversations.values()).find(conv => conv.projectId === projectId);
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.aiConvIdCounter++;
    const now = new Date();
    const newConversation: AiConversation = {
      ...conversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.aiConversations.set(id, newConversation);
    return newConversation;
  }

  async updateAiConversation(id: number, messages: Message[]): Promise<AiConversation | undefined> {
    const existingConversation = this.aiConversations.get(id);
    if (!existingConversation) return undefined;

    const updatedConversation: AiConversation = {
      ...existingConversation,
      messages: messages,
      updatedAt: new Date(),
    };
    this.aiConversations.set(id, updatedConversation);
    return updatedConversation;
  }
}

export const storage = new MemStorage();
