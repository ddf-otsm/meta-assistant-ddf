import { z } from 'zod';

export const Message = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date().nullable(),
});

export const insertProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  userId: z.number(),
});

export const insertModelDefinitionSchema = z.object({
  projectId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  code: z.string(),
  type: z.enum(['component', 'page', 'form', 'workflow', 'api', 'report', 'custom']),
});

export const schema = {
  Message,
  insertProjectSchema,
  insertModelDefinitionSchema,
}; 