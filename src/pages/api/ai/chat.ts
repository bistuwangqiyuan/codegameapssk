/**
 * AI Chat API Endpoint
 * Powers the CodeMentor DS chat interface
 */

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase/client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get user session
    const sessionToken = cookies.get('sb-auth-token')?.value;
    const guestToken = cookies.get('guest-token')?.value;

    if (!sessionToken && !guestToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, conversationHistory = [], contextCode, contextLesson, contextChallenge } = body;

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call AI service with conversation context
    const startTime = Date.now();
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
      'ai-proxy',
      {
        body: {
          action: 'chat',
          message,
          conversationHistory,
          contextCode,
          contextLesson,
          contextChallenge,
        },
      }
    );

    if (aiError) {
      console.error('AI proxy error:', aiError);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response', details: aiError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const responseTime = Date.now() - startTime;

    // Store interaction in database (for analytics)
    const userId = sessionToken ? 'user-id' : null; // TODO: Extract from session
    const guestId = guestToken || null;

    await supabase.from('ai_interactions').insert({
      user_id: userId,
      guest_id: guestId,
      interaction_type: 'chat',
      user_query: message,
      ai_response: aiResponse.response,
      context_code: contextCode,
      context_lesson_id: contextLesson,
      context_challenge_id: contextChallenge,
      provider: aiResponse.provider,
      model: aiResponse.model,
      response_time: responseTime,
      tokens_used: aiResponse.tokensUsed,
    });

    // Return AI response
    return new Response(
      JSON.stringify({
        response: aiResponse.response,
        conversationId: aiResponse.conversationId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        responseTime,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// GET endpoint for retrieving conversation history
export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const sessionToken = cookies.get('sb-auth-token')?.value;
    const guestToken = cookies.get('guest-token')?.value;

    if (!sessionToken && !guestToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const conversationId = url.searchParams.get('conversationId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // TODO: Fetch conversation history from database
    const userId = sessionToken ? 'user-id' : null;
    const guestId = guestToken || null;

    const { data: interactions } = await supabase
      .from('ai_interactions')
      .select('*')
      .or(`user_id.eq.${userId},guest_id.eq.${guestId}`)
      .eq('interaction_type', 'chat')
      .order('created_at', { ascending: false })
      .limit(limit);

    return new Response(
      JSON.stringify({
        history: interactions || [],
        count: interactions?.length || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Get conversation history error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

