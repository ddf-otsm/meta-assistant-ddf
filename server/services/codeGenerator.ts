import { ModelDefinition, ApiSpecification } from '@shared/schema';

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
const mongoose = require('mongoose');

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

module.exports = mongoose.model('${resource.name}', ${resource.name}Schema);
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
      ? "const { authenticate } = require('../middleware/auth');\n"
      : '';
    const validationMiddleware = spec.features.validation
      ? `const { validate${resource.name} } = require('../middleware/validation');\n`
      : '';

    content = `
const express = require('express');
const router = express.Router();
const ${resource.name}Controller = require('../controllers/${resource.name}Controller');
${authMiddleware}${validationMiddleware}
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

module.exports = router;
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
const ${resource.name} = require('../models/${resource.name}');

exports.getAll = async (req, res) => {
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

exports.getOne = async (req, res) => {
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

exports.create = async (req, res) => {
  try {
    const new${resource.name} = new ${resource.name}(req.body);
    const saved${resource.name} = await new${resource.name}.save();
    
    res.status(201).json(saved${resource.name});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
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

exports.delete = async (req, res) => {
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
const Joi = require('joi');

const ${resource.name}Schema = Joi.object({
${resource.properties
  .map(prop => {
    let validation = `Joi.${getJoiType(prop.type)}()`;
    if (prop.required) {
      validation += '.required()';
    }
    if (prop.type === 'string' && prop.name === 'email') {
      validation += '.email()';
    }
    return `  ${prop.name}: ${validation}`;
  })
  .join(',\n')}
});

exports.validate${resource.name} = (req, res, next) => {
  const { error } = ${resource.name}Schema.validate(req.body);
  
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
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
`;
  }

  return { path, content };
}

/**
 * Generate main app file
 */
function generateAppFile(spec: ApiSpecification): GeneratedFile {
  let path = '';
  let content = '';

  if (spec.framework.name === 'express') {
    path = `src/app.js`;

    const swaggerSetup = spec.features.documentation
      ? `
// Swagger documentation setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: '${spec.resource.name} API',
      version: '1.0.0',
      description: 'API endpoints for ${spec.resource.name} resource',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
`
      : '';

    content = `
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/${spec.resource.path}', require('./routes/${spec.resource.path}Routes'));

${swaggerSetup}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
`;
  }

  return { path, content };
}

// Helper functions
function getMongooseType(type: string): string {
  switch (type) {
    case 'string':
      return 'String';
    case 'number':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'object':
      return 'Object';
    case 'array':
      return 'Array';
    default:
      return 'String';
  }
}

function getJoiType(type: string): string {
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    case 'array':
      return 'array';
    default:
      return 'string';
  }
}

function getControllerMethodName(method: string, path: string): string {
  if (path === '' || path === '/') {
    return method === 'get' ? 'getAll' : 'create';
  } else if (path.includes(':id')) {
    switch (method) {
      case 'get':
        return 'getOne';
      case 'put':
        return 'update';
      case 'delete':
        return 'delete';
      default:
        return 'getOne';
    }
  }

  // Custom endpoint
  return `custom${path.replace(/\//g, '_').replace(/:/g, '').replace(/-/g, '_')}`;
}
