import type { AIResponse } from './types';

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
  accessCount: number;
}

/**
 * LRU Cache for AI Responses
 * Constitution Requirement: Cached AI responses MUST be used when appropriate
 */
export class AIResponseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize = 1000;
  private readonly ttl = 3600000; // 1 hour for code-specific feedback

  private generateKey(prompt: string, code?: string): string {
    return `${prompt}:${code || ''}`.slice(0, 200); // Limit key length
  }

  get(prompt: string, code?: string): AIResponse | null {
    const key = this.generateKey(prompt, code);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access count (for LRU)
    entry.accessCount++;
    entry.timestamp = Date.now();

    return { ...entry.response, cached: true };
  }

  set(prompt: string, response: AIResponse, code?: string): void {
    const key = this.generateKey(prompt, code);

    // Enforce max size (LRU eviction)
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < oldestAccess) {
        oldestAccess = entry.accessCount;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const aiCache = new AIResponseCache();

