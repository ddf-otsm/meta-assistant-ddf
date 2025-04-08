#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Variables
RESOURCE_GROUP="$DEV_RESOURCE_GROUP"
OPENAI_NAME="meta-assistant-openai"

echo "=== Checking Azure OpenAI Usage ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "OpenAI Resource: $OPENAI_NAME"
echo "Subscription: $AZURE_SUBSCRIPTION_ID"
echo "-----------------------------------"

# Login to Azure using service principal credentials from .env
echo "Logging in to Azure..."
az login --service-principal \
    --username "$AZURE_CLIENT_ID" \
    --password "$AZURE_CLIENT_SECRET" \
    --tenant "$AZURE_TENANT_ID"

# Set the subscription
echo "Setting subscription..."
az account set --subscription "$AZURE_SUBSCRIPTION_ID"

# Get resource ID
RESOURCE_ID=$(az cognitiveservices account show \
    --name "$OPENAI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "id" \
    --output tsv)

if [ -z "$RESOURCE_ID" ]; then
    echo "❌ Could not find Azure OpenAI resource: $OPENAI_NAME"
    exit 1
fi

echo "✅ Found Azure OpenAI resource: $RESOURCE_ID"

# Get all deployment details
echo "Listing all deployments and their rate limits:"
az cognitiveservices account deployment list \
    --name "$OPENAI_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "[].{deploymentName:name, model:properties.model.name, version:properties.model.version, capacity:sku.capacity, requestLimit:properties.rateLimits[?key=='request'].count|[0], tokenLimit:properties.rateLimits[?key=='token'].count|[0]}" \
    --output table

# Monitor usage for a brief period
echo
echo "=== Monitoring API Calls in Real-time ==="
echo "Checking logs for the past hour to see usage patterns..."

END_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
START_DATE=$(date -u -v-1H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "1 hour ago" +"%Y-%m-%dT%H:%M:%SZ")

# Try to get insights via resource usage
echo "Checking resource usage metrics..."
az monitor metrics list \
    --resource "$RESOURCE_ID" \
    --metric "SuccessfulCalls" \
    --start-time "$START_DATE" \
    --end-time "$END_DATE" \
    --interval PT5M \
    --output table

echo
echo "Checking for concurrent requests and throttled requests..."
az monitor metrics list \
    --resource "$RESOURCE_ID" \
    --metric "ConcurrentRequests" \
    --start-time "$START_DATE" \
    --end-time "$END_DATE" \
    --interval PT5M \
    --output table

az monitor metrics list \
    --resource "$RESOURCE_ID" \
    --metric "ThrottledCalls" \
    --start-time "$START_DATE" \
    --end-time "$END_DATE" \
    --interval PT5M \
    --output table

echo
echo "=== Usage By Client IP (if available) ==="
echo "Note: This requires Activity Logs to be enabled"

# Try to find information about which IPs are calling the service
echo "Checking activity logs for API calls..."
az monitor activity-log list \
    --resource-id "$RESOURCE_ID" \
    --start-time "$START_DATE" \
    --end-time "$END_DATE" \
    --query "[?contains(resourceId, '$OPENAI_NAME')].{timestamp:eventTimestamp, caller:caller, operation:operationName, ipAddress:httpRequest.clientIpAddress}" \
    --output table 2>/dev/null || echo "No activity logs found. May need to enable diagnostic settings."

echo
echo "=== Recommendations ==="
echo "1. Enable diagnostic settings for detailed logs:"
echo "   az monitor diagnostic-settings create \\"
echo "     --name openai-diagnostics \\"
echo "     --resource \"$RESOURCE_ID\" \\"
echo "     --logs \"[{\\\"category\\\": \\\"RequestResponse\\\", \\\"enabled\\\": true}]\" \\"
echo "     --workspace \"\$(az monitor log-analytics workspace show --resource-group \$RESOURCE_GROUP --workspace-name myworkspace --query id -o tsv)\""
echo
echo "2. Check if any other applications or services are using your OpenAI deployments"
echo "3. Consider using separate API keys for different applications"
echo "4. Request quota increase in Azure Portal if needed"
echo
echo "=== Rate Limit Solutions ==="
echo "1. Add exponential backoff in your application code"
echo "2. Batch requests to reduce total number of API calls"
echo "3. Request a quota increase via Azure Portal"
echo "4. Create separate deployments with dedicated capacity" 