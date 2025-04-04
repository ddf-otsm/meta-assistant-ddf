# Meta-Software Engineering Platform

A platform that implements the "Generate Instead of Code" approach to software engineering, where AI agents and human developers collaborate to build software that creates software.

## Core Concept

Rather than directly coding features, this platform enables you to:

1. Identify repetitive patterns in software domains
2. Create meta-models that capture these patterns
3. Generate specifications from meta-models
4. Use templates and generators to create code
5. Refine code with AI assistance

## Features

- **Pattern Recognition API**: Identifies software patterns from natural language descriptions
- **Meta-model Generation**: Creates abstract models that capture patterns
- **Specification Generator**: Transforms meta-models into concrete specifications
- **Template Generator**: Produces code templates based on meta-models
- **AI Assistant**: Provides guidance throughout the process using OpenAI's GPT-4o model

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, ShadcnUI
- **Backend**: Express.js, Node.js
- **AI Integration**: OpenAI API (GPT-4o)
- **Data Storage**: In-memory storage (with database schema)

## Setup Instructions

### Option 1: Docker Setup (Recommended for Development)

1. Make sure Docker Desktop is installed and running
2. Start the containers:
   ```bash
   npm run docker:start
   ```
3. The application will be available at http://localhost:3000
4. To stop the containers:
   ```bash
   npm run docker:stop
   ```

### Option 2: Local Setup

#### Prerequisites
- Node.js v23.11.0 or later
- npm v10.9.2 or later
- PostgreSQL 15

#### Database Setup
1. Install PostgreSQL 15:
   ```bash
   brew install postgresql@15
   ```

2. Add PostgreSQL to your PATH:
   ```bash
   echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Start PostgreSQL service:
   ```bash
   brew services start postgresql@15
   ```

4. Create database and user:
   ```bash
   psql -f scripts/setup-local-db.sql postgres
   ```

#### Application Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will be available at http://localhost:3000

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI

## Database Management

- `npm run db:push` - Push database schema changes

## Workflow Steps

The platform guides you through a structured meta-engineering approach:

1. **Concept**: Define your initial project goals
2. **Patterns**: Identify repetitive patterns in your domain
3. **Meta-model**: Create abstract models capturing these patterns
4. **Specification**: Generate concrete specifications
5. **Generator**: Design code generators for your specifications
6. **Template**: Create reusable code templates
7. **Generate**: Execute code generation
8. **Refine**: AI-assisted refinement
9. **Test**: Validate generated code
10. **Iterate**: Continuous improvement

## How to Use

### Step 1: API Specification Builder

1. Define your API resource name (e.g., "UserProfile")
2. Add resource properties with types and validation rules
3. Select which framework to use (Express.js, FastAPI, Spring Boot, or Laravel)
4. Choose additional features like authentication, documentation, etc.
5. Save your specification

### Step 2: Use AI Assistant

The AI assistant can help with:
- Understanding meta-software engineering concepts
- Suggesting patterns and abstractions
- Refining meta-models
- Debugging generated code

### Step 3: Generate Code

After defining your specification, click the "Generate" button to create code files based on your meta-models and templates.

## Known Issues and Workarounds

1. **Framework Selection**: If clicking on a framework doesn't update the selection, use the Save button first to persist your current changes, then try selecting again.

2. **Workflow Navigation**: To navigate between steps, click directly on the numbered step icons in the workflow bar at the top of the project page.

3. **Template Generation**: Some template generation requests may time out. Try using smaller meta-models or breaking them into multiple requests.

## AI Service Implementation

The platform uses OpenAI's GPT-4o model for AI assistance. The implementation can be found in `server/services/aiService.ts`. Key AI capabilities include:

- Chat-based assistance for project planning
- Pattern identification in domain descriptions
- Meta-model generation from patterns
- Template generation from meta-models
- Code refinement and analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.