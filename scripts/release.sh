#!/bin/bash

# Check if version argument is provided
if [ -z "$1" ]; then
  echo "Please provide a version number (e.g., 1.0.0)"
  exit 1
fi

VERSION=$1

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version format. Please use semantic versioning (e.g., 1.0.0)"
  exit 1
fi

# Update version in package.json
npm version $VERSION --no-git-tag-version

# Create commit
git add package.json package-lock.json
git commit -m "chore(release): v$VERSION"

# Create and push tag
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin main "v$VERSION"

echo "Release v$VERSION created and pushed to GitHub" 