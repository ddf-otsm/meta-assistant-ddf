#!/bin/bash

# Local development environment script
echo "Starting Meta-Software Engineering Platform in local development mode..."

# Set environment variables
export NODE_ENV=development
export PORT=3000

# Check if --fast flag is provided
if [[ "$*" == *--fast* ]]; then
  echo "Fast mode: Skipping type checking"
  npm run dev
else
  # Run with full checks
  echo "Full mode: Running type checking"
  npm run check && npm run dev
fi

# Exit with the status of the last command
exit $? 