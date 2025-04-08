# Documentation Index

## Core Documentation Files

- `ARCHITECTURE.md` - System architecture and design decisions
- `TESTING.md` - Testing strategies and guidelines
- `deployment.md` - Deployment procedures and configurations
- `project-structure.md` - Detailed project structure and organization
- `development-dependencies.md` - Required development tools and setup

## Setup Documentation (`setup/`)

Contains environment-specific setup guides:
- `local.md` - Local development environment setup
- `docker.md` - Docker environment setup
- `replit.md` - Replit environment setup

## Project Structure Documentation

### Configuration Files (`config/`)
- `node/` - Node.js configuration
  - `package.json` - Project dependencies and scripts
  - `package-lock.json` - Dependency lock file
- `typescript/` - TypeScript configuration
  - `tsconfig.json` - TypeScript compiler options
- `vite/` - Vite configuration
  - `vite.config.ts` - Vite build configuration
- `docker/` - Docker configuration
  - `Dockerfile` - Development Docker configuration
  - `Dockerfile.prod` - Production Docker configuration
  - `docker-compose.yml` - Development Docker Compose
  - `docker-compose.prod.yml` - Production Docker Compose
- `env/` - Environment configurations
  - `.env.example` - Environment variables template

### Environment-Specific Code (`multi-env/`)
- `local/` - Local development environment
  - `scripts/` - Local development scripts
  - `workflow_tasks/` - Local development tasks
- `replit/` - Replit environment
  - `scripts/` - Replit-specific scripts
  - `workflow_tasks/` - Replit-specific tasks
  - `.replit` - Replit configuration
- `docker/` - Docker environment
  - `scripts/` - Docker-specific scripts
  - `workflow_tasks/` - Docker-specific tasks

### Documentation (`docs/`)
- `todos/` - Project planning and tracking
  - `plans/` - Project plans and roadmaps
  - `tasks/` - Individual tasks and issues

## Quick Links

- [Local Setup Guide](setup/local.md)
- [Docker Setup Guide](setup/docker.md)
- [Replit Setup Guide](setup/replit.md)
- [Project Structure](project-structure.md)
- [Deployment Guide](deployment.md)
- [Testing Guide](TESTING.md)
- [Architecture Overview](ARCHITECTURE.md)

## Development Workflow

1. Choose your development environment:
   - [Local Development](setup/local.md)
   - [Docker Development](setup/docker.md)
   - [Replit Development](setup/replit.md)

2. Follow the setup instructions for your chosen environment

3. Refer to the [Testing Guide](TESTING.md) for testing procedures

4. Check the [Deployment Guide](deployment.md) for deployment procedures

## Contributing

When adding new documentation:
1. Place it in the appropriate directory
2. Update this index.md file
3. Add links to relevant sections
4. Follow the existing documentation style 