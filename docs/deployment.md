# Deployment Guide

## Environment-Specific Configurations

### Local Development
When running the application locally on your machine:
- Host binding: `localhost`
- Default port: 3000
- Database: Local PostgreSQL instance
- Configuration in `.env`:
  ```
  PORT=3000
  NODE_ENV=development
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meta_assistant
  ```

### Replit Environment
When deploying to Replit:
- Host binding: `0.0.0.0` (required for Replit's infrastructure)
- Port: Automatically assigned by Replit
- Database: Replit's PostgreSQL instance
- Configuration in `.env`:
  ```
  PORT=3000
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:postgres@0.0.0.0:5432/meta_assistant
  ```

## Host Binding Explanation
- `localhost` (127.0.0.1): Used for local development, only accepts connections from the local machine
- `0.0.0.0`: Used in cloud environments (like Replit), accepts connections from any network interface

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use `.env.example` as a template, without sensitive values
- Sensitive values should be set through the platform's secure environment variable system

### API Keys and Secrets
- Store API keys and secrets in environment variables
- Never hardcode sensitive values in the codebase
- Rotate API keys periodically
- Use different API keys for development and production

### Database Access
- Use strong passwords for database users
- Limit database access to necessary IP ranges
- Regular backup and monitoring of database access

## Deployment Checklist
1. Ensure all sensitive data is in `.env` and not in version control
2. Verify correct host binding for the target environment
3. Set up proper SSL/TLS certificates
4. Configure proper CORS settings
5. Enable rate limiting and security headers
6. Set up monitoring and logging
7. Configure backup strategies 