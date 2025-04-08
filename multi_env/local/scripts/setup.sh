#!/bin/bash

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

# Create symlinks for configuration files
ln -sf "$PROJECT_ROOT/config/node/package.json" "$PROJECT_ROOT/package.json"
ln -sf "$PROJECT_ROOT/config/node/package-lock.json" "$PROJECT_ROOT/package-lock.json"
ln -sf "$PROJECT_ROOT/config/typescript/tsconfig.json" "$PROJECT_ROOT/tsconfig.json"
ln -sf "$PROJECT_ROOT/config/vite/vite.config.ts" "$PROJECT_ROOT/vite.config.ts"

# Set up environment variables from local.env.example if .env doesn't exist
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    touch "$PROJECT_ROOT/.env"
    cp "$PROJECT_ROOT/config/env/local.env.example" "$PROJECT_ROOT/.env"
    echo "Created .env file from local.env.example"
    echo "Please update .env with your local configuration"
fi

# Make scripts executable
find "$PROJECT_ROOT/multi_env/local/scripts" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
find "$PROJECT_ROOT/multi_env/local/workflow_tasks" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

echo "Local development environment setup complete!"
echo "Please:"
echo "1. Update .env with your local configuration"
echo "2. Run 'npm install' to install dependencies" 