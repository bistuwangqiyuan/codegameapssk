import type { AIProvider, AIResponse, AIContext, AIConfig } from '../types';

export abstract class BaseAIProvider implements AIProvider {
  public name: string;
  public priority: number;
  protected config: AIConfig;
  protected lastHealthCheck: number = 0;
  protected healthCheckInterval = 30000; // 30 seconds

  constructor(name: string, priority: number, config: AIConfig) {
    this.name = name;
    this.priority = priority;
    this.config = config;
  }

  abstract callAPI(prompt: string, context?: AIContext): Promise<string>;

  async isHealthy(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return true; // Assume healthy if checked recently
    }

    try {
      // Simple health check with minimal prompt
      await this.callAPI('ping', undefined);
      this.lastHealthCheck = now;
      return true;
    } catch {
      return false;
    }
  }

  async call(prompt: string, context?: AIContext): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const content = await this.callAPI(prompt, context);
      const responseTime = Date.now() - startTime;

      return {
        content,
        provider: this.name,
        responseTime,
        cached: false,
      };
    } catch (error) {
      console.error(`${this.name} API call failed:`, error);
      throw error;
    }
  }

  protected buildPrompt(prompt: string, context?: AIContext): string {
    let fullPrompt = prompt;

    if (context?.code) {
      fullPrompt += `\n\nCode:\n\`\`\`${context.language || 'javascript'}\n${context.code}\n\`\`\``;
    }

    if (context?.previousErrors && context.previousErrors.length > 0) {
      fullPrompt += `\n\nPrevious errors:\n${context.previousErrors.join('\n')}`;
    }

    return fullPrompt;
  }
}

