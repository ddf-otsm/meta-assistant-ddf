import { apiRequest } from '@/lib/queryClient';

import { Message, ApiSpecification } from '@shared/schema';

interface AiServiceResult {
  message: Message;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class AIService {
  /**
   * Send a message to the AI assistant
   */
  static async sendMessage(projectId: number, content: string): Promise<AiServiceResult> {
    try {
      const response = await apiRequest('POST', `/api/projects/${projectId}/conversation`, {
        message: content,
      });

      const data = await response.json();

      // Extract the last message (should be the AI's response)
      const aiMessage = data.messages[data.messages.length - 1];

      return { message: aiMessage };
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error('Failed to communicate with the AI assistant');
    }
  }

  /**
   * Analyze a model specification and provide suggestions
   */
  static async analyzeSpecification(
    projectId: number,
    specification: ApiSpecification
  ): Promise<string> {
    try {
      const response = await apiRequest('POST', `/api/projects/${projectId}/conversation`, {
        message: `Analyze this API specification and provide suggestions for improvement:\n${JSON.stringify(specification, null, 2)}`,
      });

      const data = await response.json();

      // Extract the AI's response
      const aiMessage = data.messages[data.messages.length - 1];
      return aiMessage.content;
    } catch (error) {
      console.error('Error analyzing specification:', error);
      throw new Error('Failed to analyze the specification');
    }
  }

  /**
   * Generate a specific code snippet
   */
  static async generateCodeSnippet(
    projectId: number,
    language: string,
    task: string
  ): Promise<string> {
    try {
      const response = await apiRequest('POST', `/api/projects/${projectId}/conversation`, {
        message: `Generate a ${language} code snippet for the following task: ${task}`,
      });

      const data = await response.json();

      // Extract the AI's response
      const aiMessage = data.messages[data.messages.length - 1];
      return aiMessage.content;
    } catch (error) {
      console.error('Error generating code snippet:', error);
      throw new Error('Failed to generate code snippet');
    }
  }

  async generateResponse<T>(prompt: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data as T,
        status: response.status,
        message: 'Success',
      };
    } catch (error) {
      return {
        data: {} as T,
        status: 500,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }
}
