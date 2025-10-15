/**
 * Supabase Edge Function: AI Proxy
 * Proxies AI requests to multiple providers with fallback, rate limiting, and caching
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;
const GLM_API_KEY = Deno.env.get('GLM_API_KEY');
const MOONSHOT_API_KEY = Deno.env.get('MOONSHOT_API_KEY');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Rate limiter state (in-memory, resets on cold start)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

// Simple LRU cache
const cache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

// AI Provider configuration
const providers = [
  {
    name: 'deepseek',
    apiKey: DEEPSEEK_API_KEY,
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  {
    name: 'glm',
    apiKey: GLM_API_KEY,
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
  },
  {
    name: 'moonshot',
    apiKey: MOONSHOT_API_KEY,
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
  },
];

/**
 * Check rate limit (100 calls per user per day)
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset daily limit
    rateLimiter.set(userId, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000, // 24 hours
    });
    return true;
  }

  if (userLimit.count >= 100) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
}

/**
 * Get cached response
 */
function getCachedResponse(cacheKey: string): any | null {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }
  cache.delete(cacheKey);
  return null;
}

/**
 * Set cached response
 */
function setCachedResponse(cacheKey: string, response: any): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Simple LRU: remove oldest entry
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(cacheKey, { response, timestamp: Date.now() });
}

/**
 * Call AI provider with fallback
 */
async function callAIProvider(prompt: string, systemPrompt?: string): Promise<any> {
  for (const provider of providers) {
    if (!provider.apiKey) continue;

    try {
      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.error(`Provider ${provider.name} failed:`, await response.text());
        continue; // Try next provider
      }

      const data = await response.json();
      return {
        response: data.choices[0].message.content,
        provider: provider.name,
        model: provider.model,
        tokensUsed: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error(`Provider ${provider.name} error:`, error);
      continue; // Try next provider
    }
  }

  throw new Error('All AI providers failed');
}

/**
 * Handle feedback action
 */
async function handleFeedback(body: any): Promise<any> {
  const { code, language } = body;

  const prompt = `Analyze the following ${language} code and provide constructive feedback:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Overall assessment (score out of 100)
2. What's done well
3. Areas for improvement
4. Specific suggestions

Format as JSON: { "score": number, "feedback": string, "suggestions": string[] }`;

  const result = await callAIProvider(
    prompt,
    'You are CodeMentor DS, a friendly and encouraging programming tutor. Provide clear, actionable feedback.'
  );

  try {
    const parsed = JSON.parse(result.response);
    return {
      ...parsed,
      provider: result.provider,
      responseTime: 0, // Calculated by caller
    };
  } catch {
    return {
      score: 75,
      feedback: result.response,
      suggestions: [],
      provider: result.provider,
    };
  }
}

/**
 * Handle hint action
 */
async function handleHint(body: any): Promise<any> {
  const { context, currentCode, hintLevel } = body;

  const prompt = `The student is working on: "${context.title || context.problem_statement}"

Current code:
\`\`\`
${currentCode || 'No code yet'}
\`\`\`

Provide a hint (level ${hintLevel}/3). Level 1 is subtle, Level 3 is more direct.`;

  const result = await callAIProvider(
    prompt,
    'You are CodeMentor DS, a patient programming tutor. Give progressive hints without revealing the full solution.'
  );

  return {
    hint: result.response,
    hintLevel,
    nextHintAvailable: hintLevel < 3,
    provider: result.provider,
  };
}

/**
 * Handle chat action
 */
async function handleChat(body: any): Promise<any> {
  const { message, conversationHistory } = body;

  // Build conversation context
  const messages = conversationHistory.slice(-5); // Last 5 messages
  const contextPrompt = messages.length > 0
    ? `Previous conversation:\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\n`
    : '';

  const prompt = `${contextPrompt}Student: ${message}`;

  const result = await callAIProvider(
    prompt,
    'You are CodeMentor DS, an AI programming tutor. Help students learn web development with clear explanations and encouragement.'
  );

  return {
    response: result.response,
    conversationId: crypto.randomUUID(),
    provider: result.provider,
    model: result.model,
    tokensUsed: result.tokensUsed,
  };
}

/**
 * Main handler
 */
serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Verify JWT (simplified - should use proper JWT verification)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action } = body;

    // Extract user ID from JWT (simplified)
    const userId = 'user-' + Math.random(); // TODO: Extract from JWT

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again tomorrow.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check cache
    const cacheKey = `${action}:${JSON.stringify(body)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return new Response(JSON.stringify({ ...cached, cached: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle action
    let result;
    switch (action) {
      case 'feedback':
        result = await handleFeedback(body);
        break;
      case 'hint':
        result = await handleHint(body);
        break;
      case 'chat':
        result = await handleChat(body);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // Cache result
    setCachedResponse(cacheKey, result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('AI proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

