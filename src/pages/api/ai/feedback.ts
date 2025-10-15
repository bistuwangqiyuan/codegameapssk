/**
 * AI Feedback API Endpoint
 * Provides AI-powered feedback on user code submissions
 */

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase/client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get user session
    const sessionToken = cookies.get('sb-auth-token')?.value;
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { code, challengeId, lessonId, language = 'html' } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call AI service (using Supabase Edge Function as proxy)
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
      'ai-proxy',
      {
        body: {
          action: 'feedback',
          code,
          challengeId,
          lessonId,
          language,
        },
      }
    );

    if (aiError) {
      console.error('AI proxy error:', aiError);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI feedback', details: aiError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return AI feedback
    return new Response(
      JSON.stringify({
        feedback: aiResponse.feedback,
        suggestions: aiResponse.suggestions || [],
        score: aiResponse.score || 0,
        provider: aiResponse.provider,
        responseTime: aiResponse.responseTime,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI feedback endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

