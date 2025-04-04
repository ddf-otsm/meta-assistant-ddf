import { ApiSpecification, GeneratedCode } from '@shared/schema';

import { apiRequest } from '@/lib/queryClient';

interface GenerateCodeOptions {
  modelId: number;
  specification: ApiSpecification;
}

/**
 * Service for generating code based on model specifications
 */
export class CodeGenerator {
  /**
   * Generate code files based on a model specification
   */
  static async generateCode({ modelId }: GenerateCodeOptions): Promise<GeneratedCode[]> {
    try {
      const response = await apiRequest('POST', `/api/models/${modelId}/generate`, {});
      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Failed to generate code files');
    }
  }

  /**
   * Get all generated code files for a project
   */
  static async getGeneratedFiles(projectId: number): Promise<GeneratedCode[]> {
    try {
      const response = await apiRequest('GET', `/api/projects/${projectId}/generated`, {});
      return await response.json();
    } catch (error) {
      console.error('Error fetching generated files:', error);
      throw new Error('Failed to fetch generated code files');
    }
  }

  /**
   * Validate a model specification for potential issues
   */
  static validateSpecification(spec: ApiSpecification): string[] {
    const errors: string[] = [];

    // Check if resource name is defined
    if (!spec.resource.name) {
      errors.push('Resource name is required');
    }

    // Check if there are any properties defined
    if (!spec.resource.properties || spec.resource.properties.length === 0) {
      errors.push('At least one property must be defined');
    }

    // Check if there are any endpoints defined
    if (!spec.resource.endpoints || spec.resource.endpoints.length === 0) {
      errors.push('At least one endpoint must be defined');
    }

    // Check if framework is selected
    if (!spec.framework.name) {
      errors.push('A framework must be selected');
    }

    return errors;
  }

  /**
   * Estimate the number of files that will be generated
   */
  static estimateFileCount(spec: ApiSpecification): number {
    let count = 0;

    // Basic structure
    count += 2; // app.js + server.js

    // Model file
    count += 1;

    // Routes file
    count += 1;

    // Controller file
    count += 1;

    // Middleware files
    if (spec.features.authentication) count += 1;
    if (spec.features.validation) count += 1;

    // Documentation
    if (spec.features.documentation) count += 1;

    // Testing
    if (spec.features.testing) count += 2; // test file + test config

    // Docker
    if (spec.features.docker) count += 2; // Dockerfile + docker-compose.yml

    return count;
  }
}
