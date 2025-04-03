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

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your OpenAI API key as an environment variable:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the application: `npm run dev`
5. Access the application at: http://localhost:5000

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