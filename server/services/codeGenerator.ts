import { ModelDefinition, ApiSpecification } from '@shared/schema.js';
import mongoose from 'mongoose';
import express from 'express';
import joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import cors from 'cors';
import dotenv from 'dotenv';

interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * Generate code files based on a model definition
 */
export async function generateCode(model: ModelDefinition): Promise<GeneratedFile[]> {
  const spec = model.definition as ApiSpecification;
  const files: GeneratedFile[] = [];

  // Generate a model file
  if (spec.resource) {
    files.push(generateModelFile(spec));
  }

  // Generate routes file
  if (spec.resource && spec.resource.endpoints) {
    files.push(generateRoutesFile(spec));
  }

  // Generate controller file
  if (spec.resource) {
    files.push(generateControllerFile(spec));
  }

  // Generate validation file if requested
  if (spec.features && spec.features.validation) {
    files.push(generateValidationFile(spec));
  }

  // Generate auth middleware if requested
  if (spec.features && spec.features.authentication) {
    files.push(generateAuthFile(spec));
  }

  // Generate main app file
  files.push(generateAppFile(spec));

  return files;
}

/**
 * Generate a model file for the resource
 */
function generateModelFile(spec: ApiSpecification): GeneratedFile {
  const { resource } = spec;
  let path = '';
  let content = '';

  if (spec.framework.name === 'express') {
    path = `src/models/${resource.name}.js`;

    content = `
import mongoose from 'mongoose';

const ${resource.name}Schema = new mongoose.Schema({
${resource.properties
  .map(prop => {
    return `  ${prop.name}: {
    type: ${getMongooseType(prop.type)},
    required: ${prop.required}
  }`;
  })
  .join(',\n')}
}, { timestamps: true });

export default mongoose.model('${resource.name}', ${resource.name}Schema);
`;
  }

  return { path, content };
}

/**
 * Generate routes file for the API endpoints
 */
function generateRoutesFile(spec: ApiSpecification): GeneratedFile {
  const { resource } = spec;
  let path = '';
  let content = '';

  if (spec.framework.name === 'express') {
    path = `src/routes/${resource.path}Routes.js`;

    const authMiddleware = spec.features.authentication
      ? "import { authenticate } from '../middleware/auth.js';\n"
      : '';
    const validationMiddleware = spec.features.validation
      ? `import { validate${resource.name} } from '../middleware/validation.js';\n`
      : '';

    content = `
import express from 'express';
import ${resource.name}Controller from '../controllers/${resource.name}Controller.js';
${authMiddleware}${validationMiddleware}

const router = express.Router();

${resource.endpoints
  .map(endpoint => {
    const method = endpoint.method.toLowerCase();
    const path = endpoint.path.replace(`/api/${resource.path}`, '');
    const middlewares = [];

    if (spec.features.authentication) {
      middlewares.push('authenticate');
    }

    if (spec.features.validation && (method === 'post' || method === 'put')) {
      middlewares.push(`validate${resource.name}`);
    }

    if (endpoint.pagination) {
      middlewares.push('paginate');
    }

    const middlewareString = middlewares.length > 0 ? middlewares.join(', ') + ', ' : '';

    return `router.${method}('${path}', ${middlewareString}${resource.name}Controller.${getControllerMethodName(method, path)});`;
  })
  .join('\n')}

// Pagination middleware
const paginate = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  req.pagination = { page, limit, skip };
  next();
};

export default router;
`;
  }

  return { path, content };
}

/**
 * Generate controller file for handling the API logic
 */
function generateControllerFile(spec: ApiSpecification): GeneratedFile {
  const { resource } = spec;
  let path = '';
  let content = '';

  if (spec.framework.name === 'express') {
    path = `src/controllers/${resource.name}Controller.js`;

    content = `
import ${resource.name} from '../models/${resource.name}.js';

export const getAll = async (req, res) => {
  try {
    ${
      endpoint.pagination
        ? `
    const { skip, limit, page } = req.pagination;
    
    const ${resource.path} = await ${resource.name}.find()
      .skip(skip)
      .limit(limit);
      
    const total = await ${resource.name}.countDocuments();
    
    res.json({
      data: ${resource.path},
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });`
        : `
    const ${resource.path} = await ${resource.name}.find();
    res.json(${resource.path});`
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const ${resource.path.slice(0, -1)} = await ${resource.name}.findById(req.params.id);
    
    if (!${resource.path.slice(0, -1)}) {
      return res.status(404).json({ message: '${resource.name} not found' });
    }
    
    res.json(${resource.path.slice(0, -1)});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const new${resource.name} = new ${resource.name}(req.body);
    const saved${resource.name} = await new${resource.name}.save();
    
    res.status(201).json(saved${resource.name});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const updated${resource.name} = await ${resource.name}.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updated${resource.name}) {
      return res.status(404).json({ message: '${resource.name} not found' });
    }
    
    res.json(updated${resource.name});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const delete = async (req, res) => {
  try {
    const ${resource.path.slice(0, -1)} = await ${resource.name}.findByIdAndDelete(req.params.id);
    
    if (!${resource.path.slice(0, -1)}) {
      return res.status(404).json({ message: '${resource.name} not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
`;
  }

  return { path, content };
}

/**
 * Generate validation middleware if requested
 */
function generateValidationFile(spec: ApiSpecification): GeneratedFile {
  const { resource } = spec;
  let path = '';
  let content = '';

  if (spec.framework.name === 'express') {
    path = `src/middleware/validation.js`;

    content = `
import joi from 'joi';

export const validate${resource.name} = (req, res, next) => {
  const schema = joi.object({
${resource.properties
  .map(prop => {
    return `    ${prop.name}: joi.${getJoiType(prop.type)}()${prop.required ? '.required()' : ''}`;
  })
  .join(',\n')}
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};
`;
  }

  return { path, content };
}

/**
 * Generate authentication middleware if requested
 */
function generateAuthFile(spec: ApiSpecification): GeneratedFile {
  let path = '';
  let content = '';

  if (spec.framework.name === 'express') {
    path = `src/middleware/auth.js`;

    content = `
import jsonwebtoken from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
`;
  }

  return { path, content };
}

/**
 * Generate the main application file
 */
function generateAppFile(spec: ApiSpecification): GeneratedFile {
  let path = '';
  let content = '';

  if (spec.framework.name === 'express') {
    path = `src/index.js`;

    const authImport = spec.features.authentication
      ? "import { authenticate } from './middleware/auth.js';\n"
      : '';
    const validationImport = spec.features.validation
      ? "import { validate${resource.name} } from './middleware/validation.js';\n"
      : '';

    content = `
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
${authImport}${validationImport}
${spec.resource ? `import ${spec.resource.path}Routes from './routes/${spec.resource.path}Routes.js';\n` : ''}

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
${spec.resource ? `app.use('/api/${spec.resource.path}', ${spec.resource.path}Routes);\n` : ''}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
`;
  }

  return { path, content };
}

/**
 * Helper function to get Mongoose type from property type
 */
function getMongooseType(type: string): string {
  switch (type.toLowerCase()) {
    case 'string':
      return 'String';
    case 'number':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'Date';
    case 'array':
      return '[String]';
    default:
      return 'String';
  }
}

/**
 * Helper function to get Joi type from property type
 */
function getJoiType(type: string): string {
  switch (type.toLowerCase()) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'array':
      return 'array';
    default:
      return 'string';
  }
}

/**
 * Helper function to get controller method name from HTTP method and path
 */
function getControllerMethodName(method: string, path: string): string {
  if (path === '/') {
    return method === 'get' ? 'getAll' : 'create';
  }
  return method;
}
