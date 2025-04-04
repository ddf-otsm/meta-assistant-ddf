#!/bin/bash

# Check if we're in Replit environment
if [ -z "$REPL_ID" ]; then
    echo "Not in Replit environment. Skipping Replit setup."
    exit 1
fi

# Create symlinks for configuration files
ln -sf ../../config/node/package.json ../../package.json
ln -sf ../../config/node/package-lock.json ../../package-lock.json
ln -sf ../../config/typescript/tsconfig.json ../../tsconfig.json
ln -sf ../../config/vite/vite.config.ts ../../vite.config.ts

# Create symlinks for Replit-specific files
ln -sf multi-env/replit/.replit ./.replit
ln -sf attached_assets/replit/generated-icon.png ./generated-icon.png

# Set up environment variables from .env.example if .env doesn't exist
if [ ! -f ".env" ]; then
    cp config/env/.env.example .env
    echo "Created .env file from .env.example"
fi

# Make scripts executable
chmod +x multi-env/replit/scripts/*.sh
chmod +x multi-env/replit/workflow_tasks/*.sh

echo "Replit environment setup complete!"
echo "Please run 'npm install' to install dependencies." 