#!/bin/bash

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  echo "Azure CLI is not installed. Please install it first:"
  echo "brew install azure-cli  # For macOS"
  echo "Then authenticate with: az login"
  exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please run setup-github-secrets.sh first."
  exit 1
fi

# Source the .env file
source .env

# Function to check if a variable is set
check_var() {
  local var_name=$1
  local var_value=${!var_name}
  if [ -z "$var_value" ]; then
    echo "Error: $var_name is not set in .env file"
    exit 1
  fi
}

# Check required variables
check_var "AZURE_SUBSCRIPTION_ID"
check_var "AZURE_TENANT_ID"
check_var "AZURE_CLIENT_ID"
check_var "AZURE_CLIENT_SECRET"
check_var "DEV_RESOURCE_GROUP"
check_var "DEV_LOCATION"
check_var "DEV_VM_SIZE"
check_var "DEV_VM_NAME"
check_var "DEV_SSH_PUBLIC_KEY"

# Login to Azure
echo "Logging in to Azure..."
az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID

# Set subscription
echo "Setting subscription..."
az account set --subscription $AZURE_SUBSCRIPTION_ID

# Create resource group
echo "Creating resource group..."
az group create --name $DEV_RESOURCE_GROUP --location $DEV_LOCATION

# Create virtual network
echo "Creating virtual network..."
az network vnet create \
  --resource-group $DEV_RESOURCE_GROUP \
  --name "${DEV_VM_NAME}-vnet" \
  --address-prefix 10.0.0.0/16 \
  --subnet-name default \
  --subnet-prefix 10.0.0.0/24

# Create public IP
echo "Creating public IP..."
az network public-ip create \
  --resource-group $DEV_RESOURCE_GROUP \
  --name "${DEV_VM_NAME}-ip" \
  --allocation-method Dynamic

# Create network security group
echo "Creating network security group..."
az network nsg create \
  --resource-group $DEV_RESOURCE_GROUP \
  --name "${DEV_VM_NAME}-nsg"

# Add SSH rule to NSG
echo "Adding SSH rule to NSG..."
az network nsg rule create \
  --resource-group $DEV_RESOURCE_GROUP \
  --nsg-name "${DEV_VM_NAME}-nsg" \
  --name SSH \
  --protocol Tcp \
  --priority 1000 \
  --destination-port-range 22 \
  --access Allow

# Create network interface
echo "Creating network interface..."
az network nic create \
  --resource-group $DEV_RESOURCE_GROUP \
  --name "${DEV_VM_NAME}-nic" \
  --vnet-name "${DEV_VM_NAME}-vnet" \
  --subnet default \
  --public-ip-address "${DEV_VM_NAME}-ip" \
  --network-security-group "${DEV_VM_NAME}-nsg"

# Create virtual machine
echo "Creating virtual machine..."
az vm create \
  --resource-group $DEV_RESOURCE_GROUP \
  --name $DEV_VM_NAME \
  --location $DEV_LOCATION \
  --size $DEV_VM_SIZE \
  --nics "${DEV_VM_NAME}-nic" \
  --image UbuntuLTS \
  --admin-username $DEV_SERVER_USER \
  --ssh-key-value "$DEV_SSH_PUBLIC_KEY"

# Get public IP
echo "Getting public IP..."
PUBLIC_IP=$(az network public-ip show \
  --resource-group $DEV_RESOURCE_GROUP \
  --name "${DEV_VM_NAME}-ip" \
  --query ipAddress \
  --output tsv)

# Update .env with the new IP
echo "Updating .env with new server IP..."
sed -i '' "s/^DEV_SERVER_HOST=.*/DEV_SERVER_HOST=$PUBLIC_IP/" .env

echo "
Azure infrastructure setup complete!
Server IP: $PUBLIC_IP

Next steps:
1. Run setup-github-secrets.sh to update GitHub secrets with the new IP
2. SSH into the server using: ssh $DEV_SERVER_USER@$PUBLIC_IP
3. Set up your application on the server
" 