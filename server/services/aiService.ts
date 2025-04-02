import OpenAI from "openai";
import { ModelDefinition } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

class AIService {
  /**
   * Generate a response from the AI based on the user message and project context
   */
  async generateResponse(userMessage: string, projectModel: ModelDefinition | null): Promise<string> {
    try {
      // If no API key is set, return a fallback response
      if (!process.env.OPENAI_API_KEY) {
        return this.getFallbackResponse(userMessage);
      }
      
      let systemPrompt = `You are an AI assistant for a meta-software engineering platform called Meta-Engineer. 
Your job is to help developers design and build software that generates other software.
Respond in a helpful, knowledgeable manner about software design patterns, code generation, 
API design, and meta-engineering concepts.`;
      
      // Add project context if available
      if (projectModel) {
        systemPrompt += `\n\nCurrent project context: ${JSON.stringify(projectModel.definition, null, 2)}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 1500
      });

      return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("AI service error:", error);
      return "Sorry, I encountered an error while processing your request. Please try again later.";
    }
  }

  /**
   * Analyze a model definition and provide suggestions
   */
  async analyzeModelDefinition(model: ModelDefinition): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return "Model analysis is unavailable without an OpenAI API key.";
      }

      const prompt = `Analyze this API model definition and provide suggestions for improvement:
${JSON.stringify(model.definition, null, 2)}

Consider:
1. Data validation requirements
2. API security best practices
3. Pagination and filtering options
4. Error handling strategies
5. Documentation requirements

Provide specific, actionable feedback that would improve this API design.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert API designer who specializes in reviewing and improving API specifications." 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000
      });

      return response.choices[0].message.content || "No analysis available.";
    } catch (error) {
      console.error("AI model analysis error:", error);
      return "Sorry, I encountered an error while analyzing your model. Please try again later.";
    }
  }

  /**
   * Generate code snippets related to a specific query
   */
  async generateCodeSnippet(language: string, task: string, context: string | null = null): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return "Code generation is unavailable without an OpenAI API key.";
      }

      let prompt = `Generate a ${language} code snippet for the following task: ${task}`;
      
      if (context) {
        prompt += `\n\nContext: ${context}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert programmer who specializes in generating clean, efficient, and well-documented code. Return only the code and brief inline comments explaining key parts." 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000
      });

      return response.choices[0].message.content || "No code snippet available.";
    } catch (error) {
      console.error("AI code generation error:", error);
      return "Sorry, I encountered an error while generating code. Please try again later.";
    }
  }

  /**
   * Fallback responses when no API key is available
   */
  private getFallbackResponse(message: string): string {
    const fallbackResponses = [
      "I recommend implementing validation for input fields to ensure data integrity.",
      "Consider adding pagination to your API endpoints that return collections of items.",
      "Authentication and authorization are important aspects of API security. JWT tokens are a common approach.",
      "For code generation, templating engines like Handlebars or EJS can be quite effective.",
      "When designing your data model, think about the relationships between entities and how they'll be queried.",
      "Error handling should be consistent across your API. Consider a standardized error response format.",
      "Documentation is crucial for APIs. OpenAPI/Swagger can help automate this process.",
      "For the controller pattern, separate your business logic from your route handlers for better maintainability.",
      "Testing is essential for code generators. Consider unit tests for your templates and integration tests for the generated code.",
      "Domain-Driven Design principles can be valuable when creating meta-models for code generation."
    ];
    
    // Choose a somewhat relevant response based on the message
    if (message.toLowerCase().includes("pagination")) {
      return fallbackResponses[1];
    } else if (message.toLowerCase().includes("validation")) {
      return fallbackResponses[0];
    } else if (message.toLowerCase().includes("auth")) {
      return fallbackResponses[2];
    } else if (message.toLowerCase().includes("template") || message.toLowerCase().includes("generat")) {
      return fallbackResponses[3];
    } else if (message.toLowerCase().includes("model") || message.toLowerCase().includes("data")) {
      return fallbackResponses[4];
    } else if (message.toLowerCase().includes("error")) {
      return fallbackResponses[5];
    } else if (message.toLowerCase().includes("doc")) {
      return fallbackResponses[6];
    } else if (message.toLowerCase().includes("controller") || message.toLowerCase().includes("route")) {
      return fallbackResponses[7];
    } else if (message.toLowerCase().includes("test")) {
      return fallbackResponses[8];
    } else if (message.toLowerCase().includes("domain") || message.toLowerCase().includes("ddd")) {
      return fallbackResponses[9];
    }
    
    // If no specific match, return a random response
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

export const aiService = new AIService();
