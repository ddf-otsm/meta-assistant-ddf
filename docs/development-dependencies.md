# Development Dependencies

This document lists the tools and dependencies required for development and deployment.

## Required Tools

### Azure CLI
```bash
# Install on macOS
brew install azure-cli

# Login without browser (using service principal)
az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
```

### GitHub CLI
```bash
# Install on macOS
brew install gh

# Login
gh auth login
```

## Environment Setup

1. Install the required tools:
   ```bash
   brew install azure-cli gh
   ```

2. Configure authentication:
   - Azure: Use service principal credentials from `.env`
   - GitHub: Use personal access token

3. Verify installations:
   ```bash
   az --version
   gh --version
   ```

## Troubleshooting

### Azure CLI Issues
- If you get browser-related errors, use service principal authentication
- Make sure your service principal has the necessary permissions
- Check your Azure subscription is active

### GitHub CLI Issues
- Ensure you have a valid personal access token
- Check your GitHub account has the necessary repository permissions 