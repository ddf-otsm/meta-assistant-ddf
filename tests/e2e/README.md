# End-to-End Tests

This directory contains end-to-end (E2E) tests for the Meta Assistant platform. E2E tests verify the application works correctly from a user's perspective, testing complete flows from start to finish.

## Structure

- `flows/` - Tests for complete user workflows
- `pages/` - Tests for specific page functionality
- `utils/` - Helper utilities for E2E testing

## Running Tests

E2E tests can be run with:

```bash
npm run test:e2e
```

## Guidelines

1. Test complete user flows rather than isolated functionality
2. Use realistic data and scenarios
3. Minimize dependencies on implementation details
4. Keep tests independent of each other
5. Use explicit waits rather than fixed timeouts
6. Make tests resilient to minor UI changes

## Setup

E2E tests use Playwright for browser automation. Before running tests, ensure Playwright browsers are installed:

```bash
npx playwright install
``` 