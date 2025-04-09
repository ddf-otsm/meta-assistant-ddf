import { OpenAI } from 'openai';

import {
  ModelDefinition,
  ApiSpecification,
  MetaModel,
  Generator,
  ResourceDefinition,
  FrameworkDefinition,
  FeatureOptions,
} from '@shared/schema';
import { config } from "../config_loader";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: config.api_keys.openai || "" });

class AIService {
  /**
   * Generate a response from the AI based on the user message and project context
   */
  async generateResponse(
    userMessage: string,
    projectModel: ModelDefinition | null
  ): Promise<string> {
    try {
      // If no API key is set, return a fallback response
      if (!config.api_keys.openai) {
        return this.getFallbackResponse(userMessage);
      }

      let systemPrompt = `You are an AI assistant for a meta-software engineering platform called Meta-Engineer. 
Your job is to help developers design and build software that generates other software.
Respond in a helpful, knowledgeable manner about software design patterns, code generation, 
API design, and meta-engineering concepts.

The platform follows a structured meta-engineering approach:
1. Identify repetitive patterns in the software domain
2. Define metamodels that capture these patterns
3. Create specifications based on metamodels
4. Generate code using templates and generators
5. Refine the generated code with AI assistance

Your goal is to help users think at a higher level of abstraction, where they
build systems to build systems rather than building individual features directly.`;

      // Add project context if available
      if (projectModel) {
        systemPrompt += `\n\nCurrent project context: ${JSON.stringify(projectModel.definition, null, 2)}`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1500,
      });

      return (
        response.choices[0].message.content || "I couldn't generate a response. Please try again."
      );
    } catch (error) {
      console.error('AI service error:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again later.';
    }
  }

  /**
   * Analyze a model definition and provide suggestions
   */
  async analyzeModelDefinition(model: ModelDefinition): Promise<string> {
    try {
      if (!config.api_keys.openai) {
        return 'Model analysis is unavailable without an OpenAI API key.';
      }

      const prompt = `Analyze this API model definition and provide suggestions for improvement:
${JSON.stringify(model.definition, null, 2)}

Consider:
1. Data validation requirements
2. API security best practices
3. Pagination and filtering options
4. Error handling strategies
5. Documentation requirements
6. Metamodel patterns and reusability
7. Template opportunities for code generation

Provide specific, actionable feedback that would improve this API design.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert API designer who specializes in reviewing and improving API specifications. Focus on both immediate API design improvements and meta-level patterns that could be generalized for future code generation.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'No analysis available.';
    } catch (error) {
      console.error('AI model analysis error:', error);
      return 'Sorry, I encountered an error while analyzing your model. Please try again later.';
    }
  }

  /**
   * Generate code snippets related to a specific query
   */
  async generateCodeSnippet(
    language: string,
    task: string,
    context: string | null = null
  ): Promise<string> {
    try {
      if (!config.api_keys.openai) {
        return 'Code generation is unavailable without an OpenAI API key.';
      }

      let prompt = `Generate a ${language} code snippet for the following task: ${task}`;

      if (context) {
        prompt += `\n\nContext: ${context}`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert programmer who specializes in generating clean, efficient, and well-documented code. Return only the code and brief inline comments explaining key parts.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'No code snippet available.';
    } catch (error) {
      console.error('AI code generation error:', error);
      return 'Sorry, I encountered an error while generating code. Please try again later.';
    }
  }

  /**
   * Identify repetitive patterns in a codebase or domain description
   * This is the first step in meta-software engineering - pattern recognition
   */
  async identifyPatterns(
    codeOrDescription: string
  ): Promise<{ patterns: Array<{ name: string; description: string; examples: string[] }> }> {
    try {
      if (!config.api_keys.openai) {
        return { patterns: [] };
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a meta-software engineering expert. Your task is to identify repetitive patterns in code or domain descriptions.
For each pattern, provide:
1. A name
2. A description
3. Examples of where the pattern appears
Your output should be valid JSON in this format:
{
  "patterns": [
    {
      "name": "string",
      "description": "string",
      "examples": ["string", "string"]
    }
  ]
}`,
          },
          {
            role: 'user',
            content: `Identify repetitive patterns in the following code or domain description:
${codeOrDescription}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.patterns ? result : { patterns: [] };
    } catch (error) {
      console.error('Pattern identification error:', error);
      return { patterns: [] };
    }
  }

  /**
   * Generate a metamodel based on identified patterns
   * This is the second step in meta-software engineering - creating abstractions
   */
  async generateMetaModel(
    patterns: Array<{ name: string; description: string; examples: string[] }>,
    type: 'component' | 'page' | 'form' | 'workflow' | 'api' | 'report' | 'custom'
  ): Promise<MetaModel> {
    try {
      if (!config.api_keys.openai) {
        return {
          name: 'Default Model',
          type: type,
          config: {},
          templates: [],
        };
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a meta-software engineering expert. Your task is to create a metamodel based on identified patterns.
A metamodel defines the structure and constraints for a family of models.
Create a concise metamodel in JSON format that represents the patterns provided.
The metamodel should define a reusable structure that can generate multiple instances.
Output must be valid JSON in the format specified in the MetaModel type.`,
          },
          {
            role: 'user',
            content: `Generate a metamodel of type "${type}" based on these patterns:
${JSON.stringify(patterns, null, 2)}

Return a valid MetaModel object with these properties:
{
  "name": string,
  "description": string,
  "type": "${type}",
  "config": Record<string, any> (configuration parameters),
  "templates": string[] (template identifiers)
}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        name: result.name || 'Default Model',
        description: result.description,
        type: type,
        config: result.config || {},
        templates: result.templates || [],
      };
    } catch (error) {
      console.error('Metamodel generation error:', error);
      return {
        name: 'Error Model',
        type: type,
        config: {},
        templates: [],
      };
    }
  }

  /**
   * Generate a code template based on a metamodel
   * This is a key step in establishing the meta-engineering pipeline
   */
  async generateTemplate(
    metamodel: MetaModel,
    language: string,
    templateType: string
  ): Promise<{ content: string; placeholders: string[] }> {
    try {
      if (!config.api_keys.openai) {
        return { content: '// Template generation requires an OpenAI API key', placeholders: [] };
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a code templating expert in ${language}. Your task is to create a reusable code template
based on a metamodel specification. The template should use a simple {{placeholder}} syntax
for variable replacement. Identify all dynamic parts that would change per instance.
Include appropriate comments explaining the template usage.`,
          },
          {
            role: 'user',
            content: `Generate a ${language} code template for ${templateType} based on this metamodel:
${JSON.stringify(metamodel, null, 2)}

Return a JSON object with:
1. The template content (using {{placeholder}} syntax)
2. A list of all placeholders used in the template`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        content: result.content || '// Template generation failed',
        placeholders: result.placeholders || [],
      };
    } catch (error) {
      console.error('Template generation error:', error);
      return {
        content: '// Error generating template',
        placeholders: [],
      };
    }
  }

  /**
   * Generate a specification from a metamodel
   * This allows creating concrete instances from the abstract metamodel
   */
  async generateSpecification(
    metamodel: MetaModel,
    requirements: string
  ): Promise<ApiSpecification> {
    try {
      if (!config.api_keys.openai) {
        return {
          resource: {
            name: 'Default',
            path: '/default',
            properties: [],
            endpoints: [],
          },
          framework: {
            name: 'express',
            language: 'javascript',
          },
          features: {
            authentication: false,
            documentation: false,
            validation: false,
            testing: false,
            docker: false,
          },
        };
      }

      // Default empty structures for resource, framework and features
      const defaultResource: ResourceDefinition = {
        name: 'Resource',
        path: '/resource',
        properties: [],
        endpoints: [],
      };

      const defaultFramework: FrameworkDefinition = {
        name: 'express',
        language: 'javascript',
      };

      const defaultFeatures: FeatureOptions = {
        authentication: false,
        documentation: false,
        validation: false,
        testing: false,
        docker: false,
      };

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a meta-software engineering expert. Your task is to generate a specification
based on a metamodel and user requirements. The specification should be concrete and
detailed enough to be used for code generation. Follow the ApiSpecification format exactly.`,
          },
          {
            role: 'user',
            content: `Generate a specification based on this metamodel and requirements:

Metamodel:
${JSON.stringify(metamodel, null, 2)}

Requirements:
${requirements}

Return a valid ApiSpecification object with resource, framework, and features properties.`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      // Ensure we have a valid structure with defaults as fallback
      return {
        resource: result.resource || defaultResource,
        framework: result.framework || defaultFramework,
        features: result.features || defaultFeatures,
        metamodels: result.metamodels || [metamodel],
        generators: result.generators,
        version: result.version || '1.0.0',
      };
    } catch (error) {
      console.error('Specification generation error:', error);
      return {
        resource: {
          name: 'Error',
          path: '/error',
          properties: [],
          endpoints: [],
        },
        framework: {
          name: 'express',
          language: 'javascript',
        },
        features: {
          authentication: false,
          documentation: false,
          validation: false,
          testing: false,
          docker: false,
        },
      };
    }
  }

  /**
   * Design a code generator based on project requirements
   */
  async designGenerator(framework: FrameworkDefinition, examples: string[]): Promise<Generator> {
    try {
      if (!config.api_keys.openai) {
        return {
          name: 'Default Generator',
          language: framework.language || 'javascript',
          framework: framework.name || 'express',
          templateEngine: 'handlebars',
          outputFormats: ['js', 'json'],
        };
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a meta-software engineering expert specializing in code generation systems.
Your task is to design a code generator for a specific framework and language.
Consider appropriate template engines, output formats, and configuration options.`,
          },
          {
            role: 'user',
            content: `Design a code generator for:
- Framework: ${framework.name}
- Language: ${framework.language}

Example code patterns to consider:
${examples.join('\n\n')}

Return a Generator object with:
- name: A descriptive name for the generator
- description: Brief explanation of what it generates
- language: Target programming language
- framework: Target framework
- templateEngine: Appropriate template engine
- outputFormats: File formats it generates
- config: Any configuration parameters`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        name: result.name || 'Default Generator',
        description: result.description || `Generator for ${framework.name}`,
        language: result.language || framework.language || 'javascript',
        framework: result.framework || framework.name || 'express',
        templateEngine: result.templateEngine || 'handlebars',
        outputFormats: result.outputFormats || ['js', 'json'],
        config: result.config || {},
      };
    } catch (error) {
      console.error('Generator design error:', error);
      return {
        name: 'Error Generator',
        language: framework.language || 'javascript',
        framework: framework.name || 'express',
        templateEngine: 'handlebars',
        outputFormats: ['js'],
      };
    }
  }

  /**
   * Refine generated code based on requirements and feedback
   */
  async refineGeneratedCode(
    code: string,
    requirements: string,
    feedback: string | null = null
  ): Promise<string> {
    try {
      if (!config.api_keys.openai) {
        return code;
      }

      const feedbackPrompt = feedback ? `\n\nFeedback to address:\n${feedback}` : '';

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert code reviewer and refiner. Your task is to improve the provided
generated code based on requirements and feedback. Maintain the structure and intent
of the original code, but improve its quality, readability, and correctness.
Return only the refined code without explanations.`,
          },
          {
            role: 'user',
            content: `Refine this generated code:

\`\`\`
${code}
\`\`\`

Requirements:
${requirements}${feedbackPrompt}`,
          },
        ],
        max_tokens: 1500,
      });

      return response.choices[0].message.content || code;
    } catch (error) {
      console.error('Code refinement error:', error);
      return code;
    }
  }

  /**
   * Fallback response when no API key is available
   */
  private getFallbackResponse(message: string): string {
    return `I'm sorry, but I can't provide a personalized response as the OpenAI API key is not configured. 
Please add your API key to the configuration to enable AI assistance.

Your message was: "${message}"

To configure the API key, you can:
1. Add it to your .env file as OPENAI_API_KEY
2. Or update the config/config.yaml file
3. Or set it via environment variables before starting the server`;
  }
}

export const aiService = new AIService();
