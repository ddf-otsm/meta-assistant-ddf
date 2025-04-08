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

echo "=== Creating Dedicated Azure OpenAI Deployment for Cursor ==="
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
CURSOR_DEPLOYMENT_NAME="cursor-gpt4-high-tpm"
MODEL_NAME="gpt-4"
MODEL_VERSION="0613"  # Standard version
CAPACITY=2  # Increase capacity for higher TPM

# Check if resource group exists
echo "Checking if resource group exists..."
if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
    echo "Resource group $RESOURCE_GROUP does not exist. Creating..."
    execute_cmd az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --only-show-errors
fi

# Check if OpenAI resource exists
echo "Checking if Azure OpenAI resource exists..."
if ! az cognitiveservices account show --name "$OPENAI_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    echo "Azure OpenAI resource $OPENAI_NAME does not exist. Creating..."
    execute_cmd az cognitiveservices account create \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --kind OpenAI \
        --sku S0 \
        --location "$LOCATION" \
        --yes \
        --custom-domain "$OPENAI_NAME" \
        --api-properties "Default"
else
    echo "Azure OpenAI resource $OPENAI_NAME already exists."
fi

# Check if Cursor deployment already exists
echo "Checking if Cursor deployment already exists..."
if az cognitiveservices account deployment show \
    --name "$OPENAI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --deployment-name "$CURSOR_DEPLOYMENT_NAME" &>/dev/null; then
    echo "Cursor deployment $CURSOR_DEPLOYMENT_NAME already exists."
    echo "Do you want to delete and recreate it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Deleting existing Cursor deployment..."
        execute_cmd az cognitiveservices account deployment delete \
            --name "$OPENAI_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --deployment-name "$CURSOR_DEPLOYMENT_NAME" \
            --yes
    else
        echo "Keeping existing deployment."
        # Just regenerate API key
        regenerate_key=true
    fi
fi

# Create dedicated Cursor deployment
if [ "$regenerate_key" != "true" ]; then
    echo "Creating dedicated Cursor deployment..."
    execute_cmd az cognitiveservices account deployment create \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --deployment-name "$CURSOR_DEPLOYMENT_NAME" \
        --model-name "$MODEL_NAME" \
        --model-version "$MODEL_VERSION" \
        --model-format OpenAI \
        --sku-name Standard \
        --capacity "$CAPACITY"
    
    echo "Cursor deployment created successfully."
fi

# Regenerate API Key (use key2 to avoid affecting existing applications)
echo "Regenerating API key for Cursor..."
if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] Would regenerate API key"
    API_KEY="dummy-api-key-for-cursor"
    ENDPOINT="https://dummy-endpoint-for-cursor.openai.azure.com/"
else
    # Regenerate key2
    echo "Regenerating API key (key2)..."
    execute_cmd az cognitiveservices account keys regenerate \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --key-name key2
    
    # Get the API key
    echo "Getting API key (key2)..."
    API_KEY=$(az cognitiveservices account keys list \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "key2" \
        --output tsv)

    # Get the endpoint
    echo "Getting endpoint..."
    ENDPOINT=$(az cognitiveservices account show \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.endpoint" \
        --output tsv)
fi

# Create a cursor_config.txt file with the settings
echo "Creating cursor_config.txt with Cursor settings..."
cat > cursor_config.txt << EOF
=== Cursor Azure OpenAI Configuration ===

Base URL: ${ENDPOINT}
Deployment Name: ${CURSOR_DEPLOYMENT_NAME}
API Key: ${API_KEY}

API Version: 2024-03-01

Notes:
- This deployment has higher capacity (TPM) than the original
- If still having rate limit issues, try the older API version: 2023-07-01

Remember to:
1. Completely quit Cursor (not just close the window)
2. Wait 10-15 seconds
3. Start Cursor fresh after changing settings
EOF

echo "===================================="
echo "Cursor Configuration:"
echo "Base URL: ${ENDPOINT}"
echo "Deployment Name: ${CURSOR_DEPLOYMENT_NAME}"
echo "API Key: ${API_KEY:0:5}..."
echo "===================================="
echo
echo "These settings have been saved to cursor_config.txt"
echo
echo "IMPORTANT: After configuring Cursor:"
echo "1. Completely quit Cursor (not just close the window)"
echo "2. Wait 10-15 seconds for rate limits to reset"
echo "3. Start Cursor fresh"
echo
echo "Setup complete! You can now configure Cursor with these settings." 