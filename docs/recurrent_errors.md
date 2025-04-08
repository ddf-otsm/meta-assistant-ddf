# Recurrent Errors and Solutions

## Testing Framework Issues

### Vitest Version Conflicts

**Problem**: 
- Vitest version conflicts with other dependencies (e.g., @vitest/coverage-v8, @vitest/ui)
- Error: `Cannot find module 'vitest/config.js'`
- Module resolution errors when running tests

**Solution**:
1. Use specific version that matches other dependencies:
   ```bash
   npm install -D vitest@1.6.1
   ```
2. Import `defineConfig` from 'vite' instead of 'vitest/config.js':
   ```typescript
   import { defineConfig } from 'vite';
   ```
3. If needed, use `--legacy-peer-deps` flag to handle dependency conflicts:
   ```bash
   npm install -D vitest@1.6.1 --legacy-peer-deps
   ```

**Prevention**:
- Keep Vitest and its related packages (@vitest/coverage-v8, @vitest/ui) at compatible versions
- Document version requirements in package.json
- Use the same version across all test-related dependencies 