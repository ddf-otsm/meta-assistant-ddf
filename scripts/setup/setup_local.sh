#!/bin/bash

# Create directory structure
mkdir -p config/{node,typescript,vite,docker,replit,env}
mkdir -p scripts/{setup,docker,replit}
mkdir -p docs/setup

# Move existing files to their new locations
[ -f package.json ] && mv package.json config/node/
[ -f package-lock.json ] && mv package-lock.json config/node/
[ -f tsconfig.json ] && mv tsconfig.json config/typescript/
[ -f vite.config.ts ] && mv vite.config.ts config/vite/
[ -f Dockerfile ] && mv Dockerfile config/docker/
[ -f docker-compose.yml ] && mv docker-compose.yml config/docker/
[ -f .replit.example ] && mv .replit.example config/replit/
[ -f nix.replit.example ] && mv nix.replit.example config/replit/
[ -f .env.example ] && mv .env.example config/env/

# Create symlinks
ln -sf config/node/package.json .
ln -sf config/node/package-lock.json .
ln -sf config/typescript/tsconfig.json .
ln -sf config/vite/vite.config.ts .

# Make scripts executable
chmod +x scripts/setup/*.sh
chmod +x scripts/docker/*.sh
chmod +x scripts/replit/*.sh

echo "Local development environment setup complete!"
echo "Please run 'npm install' to install dependencies." 