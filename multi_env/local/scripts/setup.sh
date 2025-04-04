#!/bin/bash

# Create symlinks for configuration files
ln -sf ../../config/node/package.json ../../package.json
ln -sf ../../config/node/package-lock.json ../../package-lock.json
ln -sf ../../config/typescript/tsconfig.json ../../tsconfig.json
ln -sf ../../config/vite/vite.config.ts ../../vite.config.ts

# Set up environment variables from .env.example if .env doesn't exist
if [ ! -f ".env" ]; then
    cp config/env/.env.example .env
    echo "Created .env file from .env.example"
    echo "Please update .env with your local configuration"
fi

# Make scripts executable
chmod +x multi-env/local/scripts/*.sh
chmod +x multi-env/local/workflow_tasks/*.sh

echo "Local development environment setup complete!"
echo "Please:"
echo "1. Update .env with your local configuration"
echo "2. Run 'npm install' to install dependencies" 