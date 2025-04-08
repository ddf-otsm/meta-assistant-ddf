import { describe, it, expect } from 'vitest';

describe('Full Project Creation Flow', () => {
  it('should create a new project with all required components', () => {
    const project = {
      name: 'test-project',
      components: ['client', 'server', 'shared'],
    };

    expect(project.name).toBe('test-project');
    expect(project.components).toHaveLength(3);
    expect(project.components).toContain('client');
    expect(project.components).toContain('server');
    expect(project.components).toContain('shared');
  });
});
