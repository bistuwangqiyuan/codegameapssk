/**
 * Challenge Queries Service
 * Handles fetching and managing challenge data
 */

import { supabase } from '../client';
import type { Challenge } from '@/types/entities';

/**
 * Get all challenges for a lesson
 */
export async function getChallengesByLesson(lessonId: string): Promise<{
  success: boolean;
  data?: Challenge[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sequence_order', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Challenge[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific challenge
 */
export async function getChallenge(challengeId: string): Promise<{
  success: boolean;
  data?: Challenge;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Challenge };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get challenge with user progress
 */
export async function getChallengeWithProgress(
  challengeId: string,
  userId: string
): Promise<{
  success: boolean;
  data?: {
    challenge: Challenge;
    progress: any | null;
    isCompleted: boolean;
    bestScore?: number;
  };
  error?: string;
}> {
  try {
    // Get challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError) {
      return { success: false, error: challengeError.message };
    }

    // Get user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    const isCompleted = progress?.status === 'completed';
    const bestScore = progress?.score || 0;

    return {
      success: true,
      data: {
        challenge: challenge as Challenge,
        progress: progress || null,
        isCompleted,
        bestScore,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Submit challenge solution
 */
export async function submitChallenge(params: {
  challengeId: string;
  userId: string;
  code: string;
  timeSpent: number; // seconds
}): Promise<{
  success: boolean;
  data?: {
    passed: boolean;
    score: number;
    passedTests: number;
    totalTests: number;
    xpAwarded: number;
    feedback: string;
  };
  error?: string;
}> {
  try {
    // Get challenge with test cases
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', params.challengeId)
      .single();

    if (challengeError) {
      return { success: false, error: challengeError.message };
    }

    // TODO: Run test cases against submitted code
    // For now, mock validation (will be implemented in sandbox)
    const totalTests = challenge.test_cases?.length || 0;
    const passedTests = totalTests; // Mock: all tests pass
    const passed = passedTests === totalTests;
    const score = Math.round((passedTests / totalTests) * 100);

    // Calculate XP (from xp-calculator)
    const baseXP = challenge.xp_reward || 100;
    const xpAwarded = passed ? baseXP : Math.round(baseXP * (score / 100));

    // Update progress
    const { data: existingProgress } = await supabase
      .from('user_challenge_progress')
      .select('attempts')
      .eq('user_id', params.userId)
      .eq('challenge_id', params.challengeId)
      .single();

    const attempts = (existingProgress?.attempts || 0) + 1;

    const { error: updateError } = await supabase
      .from('user_challenge_progress')
      .upsert({
        user_id: params.userId,
        challenge_id: params.challengeId,
        status: passed ? 'completed' : 'in_progress',
        attempts,
        time_spent_seconds: params.timeSpent,
        code_submitted: params.code,
        score,
        completed_at: passed ? new Date().toISOString() : null,
      });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Award XP if passed
    if (passed) {
      await supabase.from('xp_transactions').insert({
        user_id: params.userId,
        amount: xpAwarded,
        source: 'challenge',
        source_id: params.challengeId,
        description: `Completed challenge: ${challenge.title}`,
      });

      // Update user total XP
      const { data: userData } = await supabase
        .from('users')
        .select('xp')
        .eq('id', params.userId)
        .single();

      await supabase
        .from('users')
        .update({ xp: (userData?.xp || 0) + xpAwarded })
        .eq('id', params.userId);
    }

    const feedback = passed
      ? `🎉 Perfect! All ${totalTests} tests passed. You earned ${xpAwarded} XP!`
      : `Keep trying! ${passedTests}/${totalTests} tests passed. Score: ${score}%`;

    return {
      success: true,
      data: {
        passed,
        score,
        passedTests,
        totalTests,
        xpAwarded,
        feedback,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user's challenge statistics
 */
export async function getChallengeStats(userId: string): Promise<{
  success: boolean;
  data?: {
    totalAttempted: number;
    totalCompleted: number;
    averageScore: number;
    totalXPEarned: number;
  };
  error?: string;
}> {
  try {
    const { data: progress } = await supabase
      .from('user_challenge_progress')
      .select('status, score')
      .eq('user_id', userId);

    const totalAttempted = progress?.length || 0;
    const totalCompleted = progress?.filter((p) => p.status === 'completed').length || 0;
    const averageScore =
      totalAttempted > 0
        ? Math.round(progress!.reduce((sum, p) => sum + (p.score || 0), 0) / totalAttempted)
        : 0;

    // Get XP from challenges
    const { data: xpData } = await supabase
      .from('xp_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('source', 'challenge');

    const totalXPEarned = xpData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    return {
      success: true,
      data: {
        totalAttempted,
        totalCompleted,
        averageScore,
        totalXPEarned,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

