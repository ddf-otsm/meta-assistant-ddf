#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/../../.." || exit

# Parse command line arguments
DETACHED=false
BUILD=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -d|--detached)
      DETACHED=true
      shift
      ;;
    -b|--build)
      BUILD=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Build command
CMD="docker-compose -f config/docker/docker-compose.yml up"

# Add flags based on arguments
if [ "$DETACHED" = true ]; then
  CMD="$CMD -d"
fi

if [ "$BUILD" = true ]; then
  CMD="$CMD --build"
fi

# Execute the command
echo "Running: $CMD"
$CMD 