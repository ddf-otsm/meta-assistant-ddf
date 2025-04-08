#!/bin/bash

# Docker production environment script
echo "Starting Meta-Software Engineering Platform in Docker production mode..."

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Check if --full flag is provided (for complete build)
if [[ "$*" == *--full* ]]; then
  echo "Full mode: Running complete build and tests"
  npm run check && npm run build && npm start
else
  # Run without rebuilding
  echo "Quick mode: Starting without rebuild"
  npm start
fi

# Exit with the status of the last command
exit $? 