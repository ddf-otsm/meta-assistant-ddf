#!/bin/bash

# Check if .env.template exists
if [ ! -f .env.template ]; then
  echo "Creating .env.template..."
  cat > .env.template << EOL
# Development Environment
DEV_SERVER_HOST=
DEV_SERVER_USER=
DEV_SERVER_PORT=22
DEV_API_URL=
DEV_DATABASE_URL=
DEV_HEALTH_CHECK_URL=

# Production Environment
PROD_SERVER_HOST=
PROD_SERVER_USER=
PROD_SERVER_PORT=22
PROD_API_URL=
PROD_DATABASE_URL=
PROD_HEALTH_CHECK_URL=

# Common
SLACK_WEBHOOK_URL=
EOL
fi

# Check if .env exists, if not copy from template
if [ ! -f .env ]; then
  cp .env.template .env
  echo "Created .env from template. Please fill in the values."
  exit 1
fi

# Function to set a GitHub secret
set_secret() {
  local secret_name=$1
  local secret_value=$2
  local environment=$3

  if [ -z "$secret_value" ]; then
    echo "Warning: $secret_name is empty, skipping..."
    return
  }

  if [ -n "$environment" ]; then
    echo "Setting $secret_name for $environment environment..."
    gh secret set $secret_name --env $environment --body "$secret_value"
  else
    echo "Setting $secret_name as repository secret..."
    gh secret set $secret_name --body "$secret_value"
  }
}

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
  echo "GitHub CLI is not installed. Please install it first:"
  echo "brew install gh  # For macOS"
  echo "Then authenticate with: gh auth login"
  exit 1
fi

# Ensure we're authenticated
if ! gh auth status &> /dev/null; then
  echo "Please login to GitHub CLI first:"
  echo "gh auth login"
  exit 1
fi

# Create GitHub environments if they don't exist
echo "Creating GitHub environments..."
gh api -X PUT repos/{owner}/{repo}/environments/development || true
gh api -X PUT repos/{owner}/{repo}/environments/production || true

# Read from .env and set secrets
echo "Setting up secrets from .env file..."
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z "${key// }" ]] && continue
  
  # Remove leading/trailing whitespace
  key=$(echo $key | xargs)
  value=$(echo $value | xargs)

  # Determine environment based on key prefix
  if [[ $key == DEV_* ]]; then
    set_secret "$key" "$value" "development"
  elif [[ $key == PROD_* ]]; then
    set_secret "$key" "$value" "production"
  else
    set_secret "$key" "$value"
  }
done < .env

echo "Secrets setup complete!"

# Create a .gitignore entry if it doesn't exist
if ! grep -q "^.env$" .gitignore 2>/dev/null; then
  echo "Adding .env to .gitignore..."
  echo ".env" >> .gitignore
fi

echo "
Next steps:
1. Fill in your values in .env
2. Run this script again to update GitHub secrets
3. Keep .env secure and never commit it
4. Share .env.template with your team
" 