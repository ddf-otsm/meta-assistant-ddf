#!/bin/bash

# Replit development environment script
echo "Starting Meta-Software Engineering Platform in Replit development mode..."

# Set environment variables
export NODE_ENV=development
export PORT=5000

# Check if --turbo flag is provided
if [[ "$*" == *--turbo* ]]; then
  echo "Turbo mode: Skipping type checking and using Replit cache"
  npm run dev
elif [[ "$*" == *--fast* ]]; then
  echo "Fast mode: Skipping type checking"
  npm run dev
else
  # Run with full checks
  echo "Full mode: Running type checking"
  npm run check && npm run dev
fi

# Exit with the status of the last command
exit $? 