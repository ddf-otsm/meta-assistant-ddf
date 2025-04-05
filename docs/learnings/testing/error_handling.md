# Error Handling and Test Fixes

## Key Learnings

### 1. Mock Organization
- Keep mocks in separate files under `__mocks__` directory
- Use consistent naming: `mock<ComponentName>.ts`
- Import mocks before the actual modules they're mocking

### 2. Test Structure
- Use `vi.hoisted` for mock initialization
- Set up mocks before importing the actual modules
- Use `vi.spyOn` for mocking specific methods
- Clear mocks in `beforeEach` to ensure test isolation

### 3. Error Handling Patterns
- Log errors before throwing them
- Use proper error types and messages
- Handle both operational and non-operational errors
- Test error scenarios explicitly

### 4. Route Testing
- Mock the router with actual route handlers
- Test both success and error paths
- Validate response status codes and bodies
- Check logging behavior

## Common Issues and Solutions

### Mock Initialization
```typescript
// Problem: Cannot access mock before initialization
const mockLogger = {
  info: vi.fn(),
  error: vi.fn()
};

// Solution: Use vi.hoisted
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn()
}));
```

### Error Testing
```typescript
// Problem: Error not properly caught
mockLogger.error.mockImplementationOnce(() => {
  throw new Error('Test error');
});

// Solution: Log error first, then throw
await mockLogger.error('Error message', { error: 'Test error' });
throw new Error('Test error');
```

## Best Practices
1. Keep mocks simple and focused
2. Test both success and failure paths
3. Validate logging behavior
4. Use proper error types and messages
5. Document test patterns and solutions 