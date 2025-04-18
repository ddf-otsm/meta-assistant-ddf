# Configuration Structure

This document outlines the organization of configuration files in the project.

## Directory Structure

```
config/
├── ts/                 # TypeScript configurations
│   ├── base.json      # Base TypeScript configuration
│   ├── dev.json       # Development-specific TypeScript configuration
│   ├── node.json      # Node.js-specific TypeScript configuration
│   └── web.json       # Web-specific TypeScript configuration
├── js/                # JavaScript tool configurations
│   ├── vite.config.ts # Vite configuration
│   └── vitest.config.ts # Vitest configuration
├── style/             # Style-related configurations
│   ├── postcss.config.js
│   └── tailwind.config.ts
├── env/              # Environment configurations
│   ├── .env
│   └── .env.example
└── build/            # Build and deployment configurations
    ├── .replit
    └── docker-compose.yml
```

## Configuration Files

### TypeScript (`config/ts/`)
- `base.json`: Base TypeScript configuration inherited by all other configs
- `dev.json`: Development-specific configuration with relaxed rules
- `node.json`: Node.js-specific configuration
- `web.json`: Web-specific configuration

### JavaScript Tools (`config/js/`)
- `vite.config.ts`: Vite bundler configuration
- `vitest.config.ts`: Vitest test runner configuration

### Style (`config/style/`)
- `postcss.config.js`: PostCSS configuration
- `tailwind.config.ts`: Tailwind CSS configuration

### Environment (`config/env/`)
- `.env`: Environment variables (not committed)
- `.env.example`: Example environment variables

### Build (`config/build/`)
- `.replit`: Replit-specific configuration
- `docker-compose.yml`: Docker Compose configuration

## Usage

The root `tsconfig.json` extends from `config/ts/base.json` and provides project-wide TypeScript configuration. Other configurations are referenced in the respective tools' commands in `package.json`.

To modify configurations:
1. Update the appropriate file in the `config/` directory
2. Update references in `package.json` if needed
3. Document changes in this file 