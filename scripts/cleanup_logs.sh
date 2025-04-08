#!/bin/bash

echo "Starting log cleanup..."

# Remove logs older than 30 days
find ./logs -type f -name "*.log" -mtime +30 -exec rm {} \;

# Remove empty log directories
find ./logs -type d -empty -delete

echo "Log cleanup complete." 