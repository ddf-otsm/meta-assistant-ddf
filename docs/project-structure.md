# Project Structure

## Root Level Files (Minimal)
Only essential files that must be at the root level for compatibility:

```
.
├── README.md           # Project documentation
├── package.json        # Node.js project configuration (symlink)
├── tsconfig.json       # TypeScript configuration (symlink)
└── vite.config.ts      # Vite build configuration (symlink)
```

## Configuration Directory (`config/`)
All configuration files organized by type:

```
config/
├── node/              # Node.js related configs
│   ├── package.json   # Original package.json
│   └── package-lock.json
│
├── typescript/        # TypeScript configs
│   └── tsconfig.json
│
├── vite/             # Vite configs
│   └── vite.config.ts
│
├── docker/           # Docker configurations
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── env/             # Environment configurations
    └── .env.example
```

## Environment-Specific Code (`multi-env/`)
Code and scripts specific to different environments:

```
multi-env/
├── local/            # Local development environment
│   ├── scripts/      # Local development scripts
│   │   ├── setup.sh
│   │   ├── dev.sh
│   │   └── test.sh
│   └── workflow_tasks/  # Local development tasks
│       ├── db-setup.sh
│       └── env-setup.sh
│
├── replit/           # Replit environment
│   ├── scripts/      # Replit-specific scripts
│   │   ├── setup.sh
│   │   └── dev.sh
│   ├── workflow_tasks/  # Replit-specific tasks
│   │   ├── db-setup.sh
│   │   └── env-setup.sh
│   └── .replit       # Replit configuration
│
└── docker/           # Docker environment
    ├── scripts/      # Docker-specific scripts
    │   ├── build.sh
    │   └── run.sh
    └── workflow_tasks/  # Docker-specific tasks
        ├── db-setup.sh
        └── env-setup.sh
```

## Documentation Directory (`docs/`)
Project documentation:

```
docs/
├── deployment.md
├── project-structure.md
└── setup/
    ├── local.md
    ├── docker.md
    └── replit.md
```

## Environment Files
- `config/env/.env.example`: Template for environment variables
- `.env`: Local environment variables (ignored in git)
- `.env.*`: Environment-specific files (ignored in git)

## Important Notes
1. Root level files are symlinks to their actual locations in `config/`
2. Environment-specific code is isolated in `multi-env/`
3. Each environment has its own scripts and workflow tasks
4. Never commit `.env` files to version control
5. Keep `.env.example` up to date with all required environment variables
6. Update documentation when adding new configuration files
7. Follow the established structure when adding new files

## Setup Scripts
- Local Development:
  ```bash
  ./multi-env/local/scripts/setup.sh
  ```
- Replit Environment:
  ```bash
  ./multi-env/replit/scripts/setup.sh
  ```
- Docker Environment:
  ```bash
  ./multi-env/docker/scripts/setup.sh
  ``` 