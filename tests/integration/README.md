# Integration Tests

This directory contains integration tests for the Meta Assistant platform. Integration tests verify that different parts of the application work together correctly.

## Structure

- `api/` - Tests for API endpoints and their interaction with services
- `database/` - Tests for database operations and migrations
- `services/` - Tests for service layer interactions

## Running Tests

Integration tests can be run with:

```bash
npm run test:integration
```

## Guidelines

1. Each test should focus on testing the interaction between multiple components
2. Mock external dependencies when possible
3. Use the test database configuration for database tests
4. Clean up any test data after tests complete
5. Organize tests by feature or module 