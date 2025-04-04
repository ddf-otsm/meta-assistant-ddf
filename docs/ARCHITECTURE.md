# Architecture Overview

## System Design

The Meta-Software Engineering Platform is built using a modern full-stack architecture:

### Frontend (Client)
- Built with React and TypeScript
- Uses Vite for fast development and building
- Implements a component-based architecture
- Uses TailwindCSS for styling
- ShadcnUI for UI components

### Backend (Server)
- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL for data storage
- Drizzle ORM for database operations
- OpenAI API integration for AI capabilities

### Shared Code
- Common types and interfaces
- Shared utilities
- Constants and configurations

## Directory Structure

```
meta-assistant-ddf/
├── client/           # Frontend application
├── server/           # Backend application
├── shared/           # Shared code
├── docs/             # Documentation
└── scripts/          # Build and deployment scripts
```

## Key Components

### Frontend
- **Components**: Reusable UI components
- **Pages**: Application routes and pages
- **Services**: API integration
- **Hooks**: Custom React hooks
- **Utils**: Helper functions

### Backend
- **Controllers**: Route handlers
- **Services**: Business logic
- **Models**: Data models
- **Middleware**: Express middleware
- **Routes**: API endpoints

## Data Flow

1. User interacts with the frontend
2. Frontend makes API calls to backend
3. Backend processes requests and interacts with:
   - Database (PostgreSQL)
   - OpenAI API
4. Backend returns response to frontend
5. Frontend updates UI based on response

## Security

- Environment variables for sensitive data
- Session-based authentication
- Input validation
- CORS configuration
- Rate limiting

## Deployment

The application can be deployed using:
- Docker containers
- Traditional server deployment
- CI/CD pipeline with GitHub Actions 