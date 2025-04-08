#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/../../.." || exit

# Parse command line arguments
FOLLOW=false
TAIL="all"
SERVICE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--follow)
      FOLLOW=true
      shift
      ;;
    -t|--tail)
      TAIL="$2"
      shift 2
      ;;
    -s|--service)
      SERVICE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Build command
CMD="docker-compose -f config/docker/docker-compose.yml logs"

# Add flags based on arguments
if [ "$FOLLOW" = true ]; then
  CMD="$CMD -f"
fi

if [ "$TAIL" != "all" ]; then
  CMD="$CMD --tail=$TAIL"
fi

if [ -n "$SERVICE" ]; then
  CMD="$CMD $SERVICE"
fi

# Execute the command
echo "Running: $CMD"
$CMD 