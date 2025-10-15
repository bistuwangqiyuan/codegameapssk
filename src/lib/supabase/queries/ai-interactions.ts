/**
 * AI Interactions Service
 * Manages AI conversation history and analytics
 */

import { supabase } from '../client';
import type { AIInteraction } from '@/types/entities';

/**
 * Save AI interaction to database
 */
export async function saveAIInteraction(params: {
  userId?: string;
  guestId?: string;
  interactionType: 'feedback' | 'hint' | 'chat' | 'explanation' | 'debug';
  userQuery: string;
  aiResponse: string;
  contextCode?: string;
  contextLessonId?: string;
  contextChallengeId?: string;
  provider: string;
  model?: string;
  responseTime?: number;
  tokensUsed?: number;
}): Promise<{ success: boolean; data?: AIInteraction; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('ai_interactions')
      .insert({
        user_id: params.userId,
        guest_id: params.guestId,
        interaction_type: params.interactionType,
        user_query: params.userQuery,
        ai_response: params.aiResponse,
        context_code: params.contextCode,
        context_lesson_id: params.contextLessonId,
        context_challenge_id: params.contextChallengeId,
        provider: params.provider,
        model: params.model,
        response_time: params.responseTime,
        tokens_used: params.tokensUsed,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AIInteraction };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get conversation history for a user
 */
export async function getConversationHistory(params: {
  userId?: string;
  guestId?: string;
  limit?: number;
}): Promise<{ success: boolean; data?: AIInteraction[]; error?: string }> {
  try {
    const { userId, guestId, limit = 50 } = params;

    let query = supabase
      .from('ai_interactions')
      .select('*')
      .eq('interaction_type', 'chat')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (guestId) {
      query = query.eq('guest_id', guestId);
    } else {
      return { success: false, error: 'User ID or Guest ID required' };
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as AIInteraction[]).reverse() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Rate an AI interaction (helpful/not helpful)
 */
export async function rateInteraction(
  interactionId: string,
  rating: -1 | 0 | 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ai_interactions')
      .update({ helpful_rating: rating })
      .eq('id', interactionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get AI usage analytics for a user
 */
export async function getAIUsageAnalytics(userId: string): Promise<{
  success: boolean;
  data?: {
    totalInteractions: number;
    feedbackRequests: number;
    hintsRequested: number;
    chatMessages: number;
    averageResponseTime: number;
    mostUsedProvider: string;
    totalTokens: number;
  };
  error?: string;
}> {
  try {
    const { data: interactions } = await supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', userId);

    if (!interactions || interactions.length === 0) {
      return {
        success: true,
        data: {
          totalInteractions: 0,
          feedbackRequests: 0,
          hintsRequested: 0,
          chatMessages: 0,
          averageResponseTime: 0,
          mostUsedProvider: 'none',
          totalTokens: 0,
        },
      };
    }

    const totalInteractions = interactions.length;
    const feedbackRequests = interactions.filter((i) => i.interaction_type === 'feedback').length;
    const hintsRequested = interactions.filter((i) => i.interaction_type === 'hint').length;
    const chatMessages = interactions.filter((i) => i.interaction_type === 'chat').length;

    const totalResponseTime = interactions.reduce(
      (sum, i) => sum + (i.response_time || 0),
      0
    );
    const averageResponseTime = Math.round(totalResponseTime / totalInteractions);

    // Count providers
    const providerCounts: Record<string, number> = {};
    interactions.forEach((i) => {
      providerCounts[i.provider] = (providerCounts[i.provider] || 0) + 1;
    });
    const mostUsedProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

    const totalTokens = interactions.reduce((sum, i) => sum + (i.tokens_used || 0), 0);

    return {
      success: true,
      data: {
        totalInteractions,
        feedbackRequests,
        hintsRequested,
        chatMessages,
        averageResponseTime,
        mostUsedProvider,
        totalTokens,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

