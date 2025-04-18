#!/bin/bash

# Generator CLI script
# This script provides a convenient way to run the repository generator tools

echo "=================================="
echo "  Meta Assistant Generator Tools  "
echo "=================================="
echo ""

# Ensure all necessary directories exist
mkdir -p scripts/generator/{templates,config,analyzer,transformer}

# Check for node and npm
if ! command -v node > /dev/null; then
  echo "Error: Node.js is not installed. Please install Node.js to use this tool."
  exit 1
fi

if ! command -v tsx > /dev/null; then
  echo "Installing tsx package..."
  npm install -g tsx
fi

# Run the UI script
tsx scripts/generator/ui.ts

exit 0 