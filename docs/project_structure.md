# Meta-Software Engineering Platform Directory Structure

This document outlines the directory structure of the Meta-Software Engineering Platform project.

## Root Structure

- `client/` - Front-end code and React application
- `server/` - Back-end Express.js API and server code
- `shared/` - Shared types and utilities used by both client and server
- `config/` - Configuration files for the application
- `docs/` - Documentation files
- `tests/` - Test files for the application
- `workflow_tasks/` - Generalizable scripts or tasks reusable across multiple projects
- `multi_env/` - Environment-specific configurations and scripts
- `logs/` - Log files and logging utilities
- `.tmp/` - Temporary files and scripts

## Multi-Environment Structure

The `multi_env/` directory contains environment-specific configurations and scripts:

- `multi_env/local_dev/` - Local development environment
  - `run_dev.sh` - Script to run the application in local development mode
  
- `multi_env/replit_dev/` - Replit development environment
  - `run_dev_repl.sh` - Script to run the application in Replit development mode
  
- `multi_env/docker_prd/` - Docker production environment
  - `run_prd.sh` - Script to run the application in Docker production mode
  
- `multi_env/kubernetes_prd/` - Kubernetes production environment (to be implemented)

## Client Structure

- `client/src/` - Source code for the React application
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `contexts/` - React context providers
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and libraries

## Server Structure

- `server/` - Back-end server code
  - `services/` - Business logic and services
  - `routes.ts` - API route definitions
  - `index.ts` - Server entry point
  - `vite.ts` - Vite configuration for development
  - `storage.ts` - Data storage interface

## Workflow and Environment Flags

The scripts in the `multi_env/` directory support various flags:

- `--fast` - Skip type checking for faster development
- `--turbo` - Skip type checking and use caching (for Replit)
- `--full` - Run complete build and tests (for production)

## Command to run the application

For local development:
```
bash multi_env/local_dev/run_dev.sh
```

For Replit development:
```
bash multi_env/replit_dev/run_dev_repl.sh
```

For Docker production:
```
bash multi_env/docker_prd/run_prd.sh
``` 