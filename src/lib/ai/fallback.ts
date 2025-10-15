import type { AIProvider, AIResponse, AIContext, CircuitBreakerState } from './types';
import { DeepSeekProvider } from './providers/deepseek';

/**
 * AI Provider Manager with Circuit Breaker Pattern
 * Constitution Requirement: Primary AI provider MUST have fallback providers
 */
export class AIProviderManager {
  private providers: AIProvider[] = [];
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 300000; // 5 minutes

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Primary: DeepSeek
    const deepseekKey = import.meta.env.DEEPSEEK_API_KEY;
    if (deepseekKey) {
      this.providers.push(new DeepSeekProvider({ apiKey: deepseekKey }));
      this.circuitBreakers.set('DeepSeek', this.createCircuitBreaker());
    }

    // TODO: Add fallback providers (GLM, Moonshot, etc.) when their implementations are ready
    // For now, we'll use DeepSeek as the primary
  }

  private createCircuitBreaker(): CircuitBreakerState {
    return {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    };
  }

  private updateCircuitBreaker(name: string, success: boolean) {
    const breaker = this.circuitBreakers.get(name);
    if (!breaker) return;

    if (success) {
      breaker.failures = 0;
      breaker.state = 'closed';
    } else {
      breaker.failures++;
      breaker.lastFailureTime = Date.now();

      if (breaker.failures >= this.failureThreshold) {
        breaker.state = 'open';
      }
    }

    this.circuitBreakers.set(name, breaker);
  }

  private isCircuitOpen(name: string): boolean {
    const breaker = this.circuitBreakers.get(name);
    if (!breaker || breaker.state === 'closed') return false;

    // Check if it's time to try again (half-open state)
    if (Date.now() - breaker.lastFailureTime > this.resetTimeout) {
      breaker.state = 'half-open';
      breaker.failures = 0;
      this.circuitBreakers.set(name, breaker);
      return false;
    }

    return breaker.state === 'open';
  }

  async getResponse(prompt: string, context?: AIContext): Promise<AIResponse> {
    // Sort providers by priority
    const sortedProviders = [...this.providers].sort((a, b) => a.priority - b.priority);

    for (const provider of sortedProviders) {
      // Skip if circuit breaker is open
      if (this.isCircuitOpen(provider.name)) {
        console.warn(`Circuit breaker open for ${provider.name}, skipping`);
        continue;
      }

      try {
        const response = await provider.call(prompt, context);
        this.updateCircuitBreaker(provider.name, true);
        return response;
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        this.updateCircuitBreaker(provider.name, false);
        continue;
      }
    }

    // All providers failed
    throw new Error('All AI providers are currently unavailable. Please try again later.');
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter((p) => !this.isCircuitOpen(p.name))
      .map((p) => p.name);
  }
}

// Singleton instance
export const aiManager = new AIProviderManager();

