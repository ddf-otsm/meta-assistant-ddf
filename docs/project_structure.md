# Project Structure

This document outlines the organization of the project files and directories.

## Root Directory Structure

```
.
├── client/              # Frontend application
├── server/              # Backend application
├── shared/              # Shared code between frontend and backend
├── multi_env/          # Environment-specific configurations
│   ├── docker_prd/     # Docker production environment
│   ├── replit_dev/     # Replit development environment
│   │   └── .replit     # Replit configuration
│   └── local_dev/      # Local development environment
├── workflow_tasks/     # Reusable workflow tasks and tools
│   ├── python/         # Python scripts
│   │   ├── process_large_file.py
│   │   ├── process_with_claude.py
│   │   └── split_large_file.py
│   └── shell/          # Shell scripts
│       ├── process_chunks.sh
│       ├── cursor_process.sh
│       └── combine_results.sh
├── docs/               # Project documentation
│   ├── README.md
│   ├── README_CLAUDE_PROCESSING.md
│   └── config_structure.md
├── tests/              # Test files
├── logs/              # Log files and test results
│   └── test_results/  # Test execution results
├── .github/            # GitHub configuration
├── .husky/             # Git hooks
├── .vscode/            # VS Code configuration
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── .eslintrc.js        # ESLint configuration
├── .eslintrc.json      # ESLint configuration (extended)
├── .prettierrc         # Prettier configuration
├── .prettierignore     # Prettier ignore rules
├── .codeclimate.yml    # Code Climate configuration
├── .lintstagedrc       # lint-staged configuration
├── theme.json          # Theme configuration
└── .gitignore          # Git ignore rules
```

## Key Directories

### `workflow_tasks/`
Contains reusable workflow tasks and tools:
- `python/`: Python scripts for various tasks
- `shell/`: Shell scripts for automation and maintenance

### `multi_env/`
Environment-specific configurations:
- `docker_prd/`: Docker production environment setup
- `replit_dev/`: Replit development environment setup (includes .replit config)
- `local_dev/`: Local development environment setup

### Core Application Directories
- `client/`: Frontend React application
- `server/`: Backend Node.js application
- `shared/`: Code shared between frontend and backend

## Usage

1. Development:
   - Use `multi_env/local_dev/` for local development
   - Use `multi_env/replit_dev/` for Replit development

2. Production:
   - Use `multi_env/docker_prd/` for Docker-based production deployment

3. Workflow Tasks:
   - Python scripts in `workflow_tasks/python/`
   - Shell scripts in `workflow_tasks/shell/`

4. Configuration:
   - All configuration files are at the root level
   - Environment-specific configs in `multi_env/`

## Naming Conventions

1. Files and folders should use underscores (_) instead of hyphens (-)
2. Configuration files should be at the root level
3. Environment-specific files should be in their respective `multi_env/` subdirectories
4. All scripts and tools should be in `workflow_tasks/`

## Maintenance

When adding new files:
1. Place them in the appropriate directory based on their purpose
2. Use underscores instead of hyphens in names
3. Update this documentation if the structure changes
4. Follow the existing naming conventions 