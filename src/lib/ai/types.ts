// AI Provider Types and Interfaces

export interface AIProvider {
  name: string;
  priority: number;
  isHealthy(): Promise<boolean>;
  call(prompt: string, context?: AIContext): Promise<AIResponse>;
}

export interface AIContext {
  code?: string;
  language?: 'html' | 'css' | 'javascript';
  lessonId?: string;
  userLevel?: number;
  previousErrors?: string[];
}

export interface AIResponse {
  content: string;
  provider: string;
  responseTime: number; // milliseconds
  cached: boolean;
}

export interface AIConfig {
  apiKey: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export type AIPromptType = 
  | 'code-feedback'
  | 'hint'
  | 'explanation'
  | 'error-analysis'
  | 'optimization'
  | 'boss-challenge';

