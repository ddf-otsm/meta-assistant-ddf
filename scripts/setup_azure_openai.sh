#!/bin/bash

# Exit on error
set -e

# Parse command line arguments
DRY_RUN=false
for arg in "$@"; do
    case $arg in
        --dry-run)
        DRY_RUN=true
        shift
        ;;
    esac
done

# Function to execute or simulate command
execute_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would execute: $*"
        return 0
    else
        "$@"
    fi
}

# Load environment variables
source .env

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

echo "Using configuration:"
echo "Resource Group: $DEV_RESOURCE_GROUP"
echo "Location: $DEV_LOCATION"
echo "Subscription: $AZURE_SUBSCRIPTION_ID"
echo "Mode: $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'LIVE')"
echo "-----------------------------------"

# Login to Azure using service principal credentials from .env
echo "Logging in to Azure..."
if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] Would login with:"
    echo "  Client ID: $AZURE_CLIENT_ID"
    echo "  Tenant ID: $AZURE_TENANT_ID"
else
    execute_cmd az login --service-principal \
        --username "$AZURE_CLIENT_ID" \
        --password "$AZURE_CLIENT_SECRET" \
        --tenant "$AZURE_TENANT_ID"
fi

# Set the subscription
echo "Setting subscription..."
execute_cmd az account set --subscription "$AZURE_SUBSCRIPTION_ID"

# Variables
RESOURCE_GROUP="$DEV_RESOURCE_GROUP"
LOCATION="$DEV_LOCATION"
OPENAI_NAME="meta-assistant-openai"
DEPLOYMENT_NAME="gpt4-deployment"
MODEL_NAME="gpt-4"
MODEL_VERSION="0613"

# Create resource group if it doesn't exist
echo "Creating resource group if it doesn't exist..."
execute_cmd az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --only-show-errors || true

# Create Azure OpenAI resource
echo "Creating Azure OpenAI resource..."
execute_cmd az cognitiveservices account create \
    --name "$OPENAI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --kind OpenAI \
    --sku S0 \
    --location "$LOCATION" \
    --yes \
    --custom-domain "$OPENAI_NAME" \
    --api-properties "Default"

# Deploy the model
echo "Deploying GPT-4 model..."
execute_cmd az cognitiveservices account deployment create \
    --name "$OPENAI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --deployment-name "$DEPLOYMENT_NAME" \
    --model-name "$MODEL_NAME" \
    --model-version "$MODEL_VERSION" \
    --model-format OpenAI \
    --sku-name Standard \
    --capacity 1

if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] Would get API key and endpoint"
    API_KEY="dummy-api-key-for-dry-run"
    ENDPOINT="https://dummy-endpoint-for-dry-run.openai.azure.com/"
else
    # Get the API key
    echo "Getting API key..."
    API_KEY=$(az cognitiveservices account keys list \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "key1" \
        --output tsv)

    # Get the endpoint
    echo "Getting endpoint..."
    ENDPOINT=$(az cognitiveservices account show \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.endpoint" \
        --output tsv)
fi

# Update .env file
echo "Updating .env file..."
if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] Would update .env with:"
    echo "AZURE_OPENAI_API_KEY=$API_KEY"
    echo "AZURE_OPENAI_ENDPOINT=$ENDPOINT"
    echo "AZURE_OPENAI_DEPLOYMENT_NAME=$DEPLOYMENT_NAME"
    echo "AZURE_OPENAI_API_VERSION=2023-12-01-preview"
else
    # Create a temporary file
    tmp_file=$(mktemp)

    # Read the existing .env file and update/add the Azure OpenAI settings
    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ $line == AZURE_OPENAI_* ]]; then
            continue
        fi
        echo "$line" >> "$tmp_file"
    done < .env

    # Add Azure OpenAI settings
    echo "" >> "$tmp_file"
    echo "# Azure OpenAI Configuration" >> "$tmp_file"
    echo "AZURE_OPENAI_API_KEY=$API_KEY" >> "$tmp_file"
    echo "AZURE_OPENAI_ENDPOINT=$ENDPOINT" >> "$tmp_file"
    echo "AZURE_OPENAI_DEPLOYMENT_NAME=$DEPLOYMENT_NAME" >> "$tmp_file"
    echo "AZURE_OPENAI_API_VERSION=2023-12-01-preview" >> "$tmp_file"

    # Replace the original .env file
    mv "$tmp_file" .env
fi

echo "Azure OpenAI setup complete! The .env file has been updated with the new credentials."

# Test the deployment (optional)
if [ "$DRY_RUN" = false ]; then
    echo "Testing the deployment..."
    curl "${ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2023-12-01-preview" \
        -H "Content-Type: application/json" \
        -H "api-key: $API_KEY" \
        -d '{
            "messages": [{"role": "user", "content": "Hello!"}],
            "temperature": 0.7,
            "max_tokens": 50
        }'
else
    echo "[DRY-RUN] Would test deployment with curl command"
fi

echo -e "\nSetup complete! You can now use Azure OpenAI in your application." 