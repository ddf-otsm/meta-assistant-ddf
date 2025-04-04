# Testing Guide

## Overview

This project uses Vitest for testing both frontend and backend code. The testing setup includes:

- Vitest for test running and coverage
- Testing Library for React component testing
- JSDOM for browser environment simulation
- Coverage reporting with V8

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Structure

### Frontend Tests
Located in `client/src/tests/`:
- Component tests
- Hook tests
- Integration tests
- E2E tests (coming soon)

### Backend Tests
Located in `server/tests/`:
- API endpoint tests
- Service tests
- Database tests
- Integration tests

## Writing Tests

### Frontend Component Test Example
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '@/components/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Backend API Test Example
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@server/src/index';

describe('API Endpoints', () => {
  it('GET /api/health returns 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });
});
```

## Test Coverage

Coverage reports are generated using V8 and can be viewed in:
- Text format in the terminal
- HTML format in `coverage/` directory
- JSON format for CI integration

## Continuous Integration

Tests are automatically run on:
- Pull requests to main branch
- Pushes to main branch
- Scheduled runs (optional)

## Best Practices

1. Write tests for critical paths first
2. Keep tests focused and isolated
3. Use meaningful test descriptions
4. Follow the Arrange-Act-Assert pattern
5. Mock external dependencies
6. Clean up after tests
7. Maintain good coverage (aim for >80%) 