#!/bin/bash

# Create symlinks for configuration files
ln -sf ../../config/node/package.json ../../package.json
ln -sf ../../config/node/package-lock.json ../../package-lock.json
ln -sf ../../config/typescript/tsconfig.json ../../tsconfig.json
ln -sf ../../config/vite/vite.config.ts ../../vite.config.ts

# Make scripts executable
chmod +x ../scripts/*.sh
chmod +x ../workflow_tasks/*.sh

echo "Local development environment setup complete!"
echo "Please run 'npm install' to install dependencies." 