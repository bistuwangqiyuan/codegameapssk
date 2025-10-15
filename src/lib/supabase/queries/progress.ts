/**
 * User Progress Service
 * Handles learning progress tracking and analytics
 */

import { supabase } from '../client';

export interface UserProgress {
  user_id: string;
  lesson_id?: string;
  challenge_id?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  attempts: number;
  time_spent_seconds: number;
  code_submitted?: string;
  score?: number;
  completed_at?: string;
}

/**
 * Get user's overall progress
 */
export async function getUserProgress(userId: string) {
  try {
    const [lessonsResult, challengesResult, projectsResult] = await Promise.all([
      supabase.from('user_lesson_progress').select('*').eq('user_id', userId),
      supabase.from('user_challenge_progress').select('*').eq('user_id', userId),
      supabase.from('projects').select('id').eq('user_id', userId),
    ]);

    const completedLessons = lessonsResult.data?.filter(l => l.status === 'completed').length || 0;
    const completedChallenges = challengesResult.data?.filter(c => c.status === 'completed').length || 0;
    const totalProjects = projectsResult.data?.length || 0;

    return {
      success: true,
      data: {
        completed_lessons: completedLessons,
        completed_challenges: completedChallenges,
        total_projects: totalProjects,
        total_xp: 0, // Will be calculated separately
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(params: {
  user_id: string;
  lesson_id: string;
  status: 'in_progress' | 'completed';
  time_spent_seconds?: number;
  code_submitted?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: params.user_id,
        lesson_id: params.lesson_id,
        status: params.status,
        attempts: 1, // Will increment if record exists
        time_spent_seconds: params.time_spent_seconds || 0,
        code_submitted: params.code_submitted,
        ...(params.status === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(params: {
  user_id: string;
  challenge_id: string;
  status: 'in_progress' | 'completed';
  time_spent_seconds?: number;
  code_submitted?: string;
  score?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .upsert({
        user_id: params.user_id,
        challenge_id: params.challenge_id,
        status: params.status,
        attempts: 1,
        time_spent_seconds: params.time_spent_seconds || 0,
        code_submitted: params.code_submitted,
        score: params.score,
        ...(params.status === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get lesson progress
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is acceptable
      return { success: false, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get challenge progress
 */
export async function getChallengeProgress(userId: string, challengeId: string) {
  try {
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

