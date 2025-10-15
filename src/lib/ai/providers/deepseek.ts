import { BaseAIProvider } from './base';
import type { AIContext, AIConfig } from '../types';

export class DeepSeekProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super('DeepSeek', 1, config); // Priority 1 (highest)
  }

  async callAPI(prompt: string, context?: AIContext): Promise<string> {
    const fullPrompt = this.buildPrompt(prompt, context);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are CodeMentor DS, a friendly AI programming tutor helping beginners learn HTML5, CSS, and JavaScript. Provide clear, encouraging feedback in simple language.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

