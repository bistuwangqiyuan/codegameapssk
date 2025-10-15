/**
 * AI Hint API Endpoint
 * Provides contextual hints for challenges and lessons
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
    const { challengeId, lessonId, currentCode, hintLevel = 1 } = body;

    if (!challengeId && !lessonId) {
      return new Response(
        JSON.stringify({ error: 'Challenge ID or Lesson ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get challenge/lesson context
    let context: any = {};
    if (challengeId) {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('*, lessons(*)')
        .eq('id', challengeId)
        .single();
      context = challenge;
    } else if (lessonId) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      context = lesson;
    }

    // Call AI service
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
      'ai-proxy',
      {
        body: {
          action: 'hint',
          context,
          currentCode,
          hintLevel,
        },
      }
    );

    if (aiError) {
      console.error('AI proxy error:', aiError);
      return new Response(
        JSON.stringify({ error: 'Failed to get hint', details: aiError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return hint
    return new Response(
      JSON.stringify({
        hint: aiResponse.hint,
        hintLevel: aiResponse.hintLevel,
        nextHintAvailable: aiResponse.nextHintAvailable,
        provider: aiResponse.provider,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI hint endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

