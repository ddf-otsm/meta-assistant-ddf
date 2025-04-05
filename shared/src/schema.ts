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

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  components: z.array(z.string()),
});

export type Project = z.infer<typeof projectSchema>;

export const validateRequest = (req, res, next) => {
  try {
    projectSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

export const schema = {
  Message,
  insertProjectSchema,
  insertModelDefinitionSchema,
};
