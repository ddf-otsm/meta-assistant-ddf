import {
  pgTable,
  text,
  serial,
  integer,
  boolean as pgBoolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// User model
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  displayName: text('display_name'),
  isActive: pgBoolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

// Project model
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  userId: true,
});

// ModelDefinition model (represents a meta-model)
export const modelDefinitions = pgTable('model_definitions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  projectId: integer('project_id').notNull(),
  definition: jsonb('definition').notNull(), // Stores the model structure
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertModelDefinitionSchema = createInsertSchema(modelDefinitions).pick({
  name: true,
  projectId: true,
  definition: true,
});

// Template model (code generation templates)
export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  projectId: integer('project_id').notNull(),
  content: text('content').notNull(), // The template content with placeholders
  language: text('language').notNull(), // Programming language
  type: text('type').notNull(), // e.g., 'controller', 'model', 'view'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  projectId: true,
  content: true,
  language: true,
  type: true,
});

// GeneratedCode model (keeps track of generated code)
export const generatedCode = pgTable('generated_code', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull(),
  modelId: integer('model_id').notNull(), // Reference to the model definition
  code: text('code').notNull(), // Generated code
  path: text('path').notNull(), // Where the code should be placed
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertGeneratedCodeSchema = createInsertSchema(generatedCode).pick({
  projectId: true,
  modelId: true,
  code: true,
  path: true,
});

// AI Conversation model (stores conversations with AI assistant)
export const aiConversations = pgTable('ai_conversations', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull(),
  messages: jsonb('messages').notNull(), // Array of messages
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).pick({
  projectId: true,
  messages: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ModelDefinition = typeof modelDefinitions.$inferSelect;
export type InsertModelDefinition = z.infer<typeof insertModelDefinitionSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type GeneratedCode = typeof generatedCode.$inferSelect;
export type InsertGeneratedCode = z.infer<typeof insertGeneratedCodeSchema>;

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

// Type definitions for frontend use
export type ResourceProperty = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  validation?: string[];
  defaultValue?: unknown;
};

export type Endpoint = {
  method: string;
  path: string;
  description: string;
  parameters?: ResourceProperty[];
  responses?: {
    status: number;
    description: string;
    schema?: string;
  }[];
  security?: string[];
  pagination?: boolean;
  filtering?: boolean;
};

export type ResourceDefinition = {
  name: string;
  path: string;
  description?: string;
  properties: ResourceProperty[];
  endpoints: Endpoint[];
  relationships?: {
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    target: string;
    name: string;
    inverseName?: string;
  }[];
};

export type FrameworkDefinition = {
  name: string;
  language: string;
  version?: string;
  libraries?: string[];
  features?: string[];
};

export type FeatureOptions = {
  authentication: boolean;
  documentation: boolean;
  validation: boolean;
  testing: boolean;
  docker: boolean;
  caching?: boolean;
  logging?: boolean;
  monitoring?: boolean;
  rateLimit?: boolean;
  versioning?: boolean;
};

export type MetaModel = {
  name: string;
  description?: string;
  type: 'component' | 'page' | 'form' | 'workflow' | 'api' | 'report' | 'custom';
  config: Record<string, unknown>;
  templates: string[]; // References to template IDs or names
};

export type Generator = {
  name: string;
  description?: string;
  language: string;
  framework: string;
  templateEngine: string;
  outputFormats: string[];
  config?: Record<string, unknown>;
};

export type ApiSpecification = {
  resource: ResourceDefinition;
  framework: FrameworkDefinition;
  features: FeatureOptions;
  metamodels?: MetaModel[];
  generators?: Generator[];
  version?: string;
};

export type ProjectStep =
  | 'concept' // Initial project concept and goals
  | 'patterns' // Identify repetitive patterns in the domain
  | 'metamodel' // Define the meta-models for code generation
  | 'specification' // Create specifications using meta-models
  | 'generator' // Define/select the code generators
  | 'template' // Create code templates
  | 'generate' // Execute generation process
  | 'refine' // AI-assisted refinement of generated code
  | 'test' // Test the generated system
  | 'iterate'; // Cycle back with improvements;

export type WorkflowState = {
  currentStep: ProjectStep;
  steps: ProjectStep[];
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};
