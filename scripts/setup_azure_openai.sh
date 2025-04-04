#!/bin/bash

# Exit on error
set -e

# Parse command line arguments
DRY_RUN=false
TEST_CREDENTIALS=false
TROUBLESHOOT_CURSOR=false
CHECK_RATE_LIMITS=false
CHECK_QUOTA=false
for arg in "$@"; do
    case $arg in
        --dry-run)
        DRY_RUN=true
        shift
        ;;
        --test-credentials)
        TEST_CREDENTIALS=true
        shift
        ;;
        --troubleshoot-cursor)
        TROUBLESHOOT_CURSOR=true
        shift
        ;;
        --check-rate-limits)
        CHECK_RATE_LIMITS=true
        shift
        ;;
        --check-quota)
        CHECK_QUOTA=true
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

# Function to test Azure OpenAI credentials
test_credentials() {
    echo "Testing Azure OpenAI credentials..."
    
    # Load environment variables
    source .env
    
    if [ -z "$AZURE_OPENAI_API_KEY" ] || [ -z "$AZURE_OPENAI_ENDPOINT" ] || [ -z "$AZURE_OPENAI_DEPLOYMENT_NAME" ]; then
        echo "Error: Missing required Azure OpenAI credentials in .env file"
        exit 1
    fi
    
    echo "Testing with endpoint: $AZURE_OPENAI_ENDPOINT"
    echo "Using deployment: $AZURE_OPENAI_DEPLOYMENT_NAME"
    echo "API version: 2023-12-01-preview"
    
    # Create temporary files for response and debug info
    temp_dir=$(mktemp -d 2>/dev/null || mktemp -d -t 'azureopenai')
    response_file="${temp_dir}/response.json"
    debug_file="${temp_dir}/debug.txt"
    
    # Add verbose logging for debugging
    echo "Request URL: ${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2023-12-01-preview" > "$debug_file"
    
    # Test the deployment with more verbose output for debugging
    status_code=$(curl -s -o "$response_file" -w "%{http_code}" \
        "${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2023-12-01-preview" \
        -H "Content-Type: application/json" \
        -H "api-key: $AZURE_OPENAI_API_KEY" \
        -d '{
            "messages": [{"role": "user", "content": "Hello!"}],
            "temperature": 0.7,
            "max_tokens": 50
        }' 2>> "$debug_file")
    
    # Get response body from file
    body=$(cat "$response_file")
    
    if [ "$status_code" -eq 200 ]; then
        echo "✅ Credentials test successful!"
        echo "Response: $body"
        
        # Extract model information if possible
        if command -v jq >/dev/null 2>&1; then
            model=$(echo "$body" | jq -r '.model // "Unknown"')
            echo "Model: $model"
        fi
    else
        echo "❌ Credentials test failed with status code: $status_code"
        echo "Error response: $body"
        echo "Debug information: $(cat "$debug_file")"
        
        # Show suggestions based on common errors
        case $status_code in
            401)
                echo "Suggestion: Your API key appears to be invalid or expired"
                ;;
            404)
                echo "Suggestion: The deployment name may be incorrect or doesn't exist"
                ;;
            400)
                echo "Suggestion: The request format may be incorrect, or the model might not support chat completions"
                if [[ "$body" == *"model"* ]]; then
                    echo "         → The model name might be missing or incorrect"
                fi
                ;;
        esac
        
        # Clean up
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # Save debug info
    echo "Debug information saved to: $debug_file"
    echo "Response saved to: $response_file"
    echo
    echo "These files will be helpful for troubleshooting Cursor integration:"
    echo "- To view debug info: cat $debug_file"
    echo "- To view response: cat $response_file"
    
    # Don't remove temp files so they can be examined later
    echo "Remember to remove these temporary files later with: rm -rf $temp_dir"
}

# Function to troubleshoot Cursor integration
troubleshoot_cursor() {
    echo "=== Troubleshooting Cursor Integration with Azure OpenAI ==="
    echo
    
    # First, test credentials to make sure they're valid
    test_credentials
    
    echo
    echo "=== Cursor Integration Troubleshooting Guide ==="
    echo
    echo "Cursor caches Azure credentials. If you've made changes to your Azure OpenAI"
    echo "configuration, you need to restart Cursor completely."
    echo
    echo "✅ Common Fixes:"
    echo "1. Restart Cursor after updating credentials (even if they appear saved)"
    echo "2. In Cursor settings, ensure API version is set to 2023-12-01-preview"
    echo "3. Verify the deployment is specifically a chat completion model"
    echo
    echo "✅ Rate Limit Issues:"
    echo "If you're seeing 'User API Key Rate limit exceeded' errors:"
    echo "1. Check your Azure OpenAI quota in Azure portal"
    echo "2. Increase your quota if possible (Azure Portal → Resource → Quotas & limits)"
    echo "3. Add throttling to your applications using this key" 
    echo "4. Try creating a new deployment with a different model version"
    echo "5. Check if other applications are using the same key"
    echo
    echo "✅ Current Quota Usage:"
    # Use Azure CLI to check quota usage if logged in
    if az account show >/dev/null 2>&1; then
        echo "Checking quota usage for your Azure OpenAI deployment..."
        az cognitiveservices account list-usage \
            --name "$OPENAI_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --query "[].{Name:name, CurrentValue:currentValue, Limit:limit}" \
            --output table 2>/dev/null || echo "Unable to check quota usage. Please check in Azure Portal."
    else
        echo "Not logged in to Azure CLI. Check quota in Azure Portal."
    fi
    echo
    echo "✅ Cursor Settings Format:"
    echo "Base URL: ${AZURE_OPENAI_ENDPOINT}"
    echo "Deployment Name: ${AZURE_OPENAI_DEPLOYMENT_NAME}"
    echo "API Key: ${AZURE_OPENAI_API_KEY:0:5}..."
    echo "API Version: 2023-12-01-preview"
    echo
    echo "✅ Alternative Settings Format:"
    echo "Base URL: ${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}"
    echo "API Key: ${AZURE_OPENAI_API_KEY:0:5}..."
    echo "API Version: 2023-12-01-preview"
    echo
    echo "=== Monitoring Cursor Requests ==="
    echo "To capture Cursor's actual API requests (advanced):"
    echo "sudo tcpdump -i any -A -s 0 port 443 and host $(echo ${AZURE_OPENAI_ENDPOINT} | sed 's|https://||' | sed 's|/||g')"
    echo 
    echo "Note: When you enable Azure OpenAI in Cursor, you may lose connection"
    echo "to the default model temporarily. This is expected behavior."
}

# Function to check and update rate limits
check_rate_limits() {
    echo "=== Checking Azure OpenAI Rate Limits ==="
    echo

    # Load environment variables
    source .env
    
    # Ensure we're logged in to Azure CLI
    if ! az account show >/dev/null 2>&1; then
        echo "Logging in to Azure..."
        if [ "$DRY_RUN" = true ]; then
            echo "[DRY-RUN] Would login with:"
            echo "  Client ID: $AZURE_CLIENT_ID"
            echo "  Tenant ID: $AZURE_TENANT_ID"
        else
            az login --service-principal \
                --username "$AZURE_CLIENT_ID" \
                --password "$AZURE_CLIENT_SECRET" \
                --tenant "$AZURE_TENANT_ID" || {
                    echo "Failed to log in to Azure. Please check your credentials."
                    echo "1. Try logging in manually with: az login"
                    echo "2. Check rate limits in Azure portal: https://portal.azure.com/"
                    exit 1
                }
        fi
    fi
    
    # Set the subscription
    echo "Setting subscription: $AZURE_SUBSCRIPTION_ID"
    az account set --subscription "$AZURE_SUBSCRIPTION_ID"
    
    echo
    echo "Current Rate Limits and Quota:"
    az cognitiveservices account list-usage \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "[].{Name:name, CurrentValue:currentValue, Limit:limit}" \
        --output table || echo "Unable to retrieve quota information. Check Azure Portal."
    
    echo
    echo "=== Rate Limit Diagnostics ==="
    
    # Test endpoints with different TPM (tokens per minute) rates
    echo "Testing with low TPM (1 token)..."
    curl -s "${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2023-12-01-preview" \
        -H "Content-Type: application/json" \
        -H "api-key: $AZURE_OPENAI_API_KEY" \
        -d '{
            "messages": [{"role": "user", "content": "Hi"}],
            "max_tokens": 1
        }' | grep -o '"error":\s*{[^}]*}' || echo "No error (good)"
    
    echo
    echo "=== Rate Limit Solutions ==="
    echo "1. Increase Quota: Visit Azure Portal → OpenAI resource → Quotas & limits"
    echo "2. Create New Deployment: Try a different model or region with less usage"
    echo "3. Implement Throttling: Add 1 second delay between requests in app code"
    echo "4. Check All Applications: Ensure no other apps are using same API key"
    echo "5. Monitor Usage: Add Azure Monitor alerts for quota limits"
    echo
    echo "To request quota increase in Azure Portal:"
    echo "1. Navigate to: https://portal.azure.com/"
    echo "2. Find your Azure OpenAI resource"
    echo "3. Select 'Quotas & limits'"
    echo "4. Click 'Request Quota Increase'"
}

# Function to check quota and TPM usage with API version fix
check_quota() {
    echo "=== Checking Azure OpenAI Quota and TPM Usage ==="
    echo

    # Load environment variables
    source .env
    
    # Variables
    RESOURCE_GROUP="$DEV_RESOURCE_GROUP"
    OPENAI_NAME="meta-assistant-openai"
    
    echo "Resource Group: $RESOURCE_GROUP"
    echo "OpenAI Resource: $OPENAI_NAME"
    
    # Ensure we're logged in to Azure CLI
    if ! az account show >/dev/null 2>&1; then
        echo "Logging in to Azure..."
        az login --service-principal \
            --username "$AZURE_CLIENT_ID" \
            --password "$AZURE_CLIENT_SECRET" \
            --tenant "$AZURE_TENANT_ID" || {
                echo "Failed to log in to Azure. Trying interactive login..."
                az login || {
                    echo "Failed to log in to Azure. Please check your credentials."
                    echo "Check quota in Azure portal: https://portal.azure.com/"
                    exit 1
                }
            }
    fi
    
    # Set the subscription
    echo "Setting subscription: $AZURE_SUBSCRIPTION_ID"
    az account set --subscription "$AZURE_SUBSCRIPTION_ID"
    
    # Get the OpenAI resource details
    echo "Fetching details for Azure OpenAI resource: $OPENAI_NAME"
    resource_id=$(az cognitiveservices account show \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "id" \
        --output tsv 2>/dev/null)
        
    if [ -z "$resource_id" ]; then
        echo "❌ Could not find Azure OpenAI resource: $OPENAI_NAME"
        echo "Please check Azure Portal manually."
    else
        echo "✅ Found Azure OpenAI resource: $resource_id"
        
        # Try multiple API versions for quota
        for api_version in "2024-03-01" "2023-07-01" "2023-12-01"; do
            echo "Trying API version: $api_version"
            quotas=$(az rest --method GET \
                --uri "${resource_id}/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}?api-version=${api_version}" \
                --query "properties.raiPolicyName" 2>/dev/null || echo "Failed")
                
            if [ "$quotas" != "Failed" ]; then
                echo "✅ Successfully queried with API version: $api_version"
                
                # Get deployment details
                deployment_info=$(az rest --method GET \
                    --uri "${resource_id}/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}?api-version=${api_version}" \
                    --query "{model:properties.model, capacity:sku.capacity, version:properties.version}" \
                    --output json 2>/dev/null || echo "{}")
                
                echo "Deployment Information:"
                echo "$deployment_info" | grep -v "^$" | sed 's/^/  /'
                
                # Get quota limits from account-level info
                echo "Getting quota limits for all deployments..."
                quota_info=$(az rest --method GET \
                    --uri "${resource_id}?api-version=${api_version}" \
                    --query "properties.quotaLimits" \
                    --output json 2>/dev/null || echo "{}")
                
                if [ "$quota_info" != "{}" ]; then
                    echo "Quota Limits Information:"
                    echo "$quota_info" | grep -v "^$" | sed 's/^/  /'
                    
                    # Try to extract TPM if possible
                    tpm=$(echo "$quota_info" | grep -o '"tpm":[0-9]*' | cut -d':' -f2)
                    if [ -n "$tpm" ]; then
                        echo "  Tokens Per Minute (TPM): $tpm"
                    fi
                else
                    echo "❌ Could not retrieve quota information with this API version."
                fi
                
                # Successfully got info with this version, break out of loop
                break
            else
                echo "❌ Failed with API version: $api_version"
            fi
        done
    fi
    
    echo
    echo "=== Manual Check Instructions ==="
    echo "To check quota and usage in Azure Portal:"
    echo "1. Go to: https://portal.azure.com/"
    echo "2. Navigate to your Azure OpenAI resource: $OPENAI_NAME"
    echo "3. Click on 'Quotas & limits' in the left menu"
    echo "4. Check the 'TPM' value for your deployment: $AZURE_OPENAI_DEPLOYMENT_NAME"
    echo
    echo "=== Cursor Rate Limit Solutions ==="
    echo "1. Regenerate API key: Create a new key dedicated just for Cursor"
    echo "   - In Azure Portal -> Azure OpenAI resource -> Keys and Endpoint -> Regenerate Key 2"
    echo "   - Use this new key only for Cursor"
    echo
    echo "2. Create a separate deployment: Make a new deployment just for Cursor"
    echo "   - In Azure Portal -> Azure OpenAI resource -> Model deployments -> Create new deployment"
    echo "   - Name it 'cursor-gpt4' and use the same model (gpt-4)"
    echo "   - Update Cursor settings to use this new deployment"
    echo
    echo "3. Try different API versions in Cursor's settings:"
    echo "   - 2024-03-01"
    echo "   - 2023-07-01"
    echo
    echo "4. Completely restart Cursor after making changes"
    echo "   - Quit Cursor completely (not just close window)"
    echo "   - Wait 10 seconds for rate limits to reset"
    echo "   - Start Cursor fresh"
}

# If --test-credentials is specified, run the test and exit
if [ "$TEST_CREDENTIALS" = true ]; then
    test_credentials
    exit 0
fi

# If --troubleshoot-cursor is specified, run the troubleshooting guide and exit
if [ "$TROUBLESHOOT_CURSOR" = true ]; then
    troubleshoot_cursor
    exit 0
fi

# If --check-rate-limits is specified, check rate limits
if [ "$CHECK_RATE_LIMITS" = true ]; then
    check_rate_limits
    exit 0
fi

# If --check-quota is specified, check quota limits
if [ "$CHECK_QUOTA" = true ]; then
    check_quota
    exit 0
fi

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