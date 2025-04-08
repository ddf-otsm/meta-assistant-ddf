#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/../../.." || exit

# Parse command line arguments
VOLUMES=false
ALL=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--volumes)
      VOLUMES=true
      shift
      ;;
    -a|--all)
      ALL=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Build command
CMD="docker-compose -f config/docker/docker-compose.yml down"

# Add flags based on arguments
if [ "$VOLUMES" = true ]; then
  CMD="$CMD -v"
fi

if [ "$ALL" = true ]; then
  CMD="$CMD --remove-orphans"
fi

# Execute the command
echo "Running: $CMD"
$CMD 