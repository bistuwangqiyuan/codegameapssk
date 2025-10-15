/**
 * User Progress Analytics Service
 * Track user activity, engagement, and learning metrics
 */

import { supabase } from '../client';

export interface UserAnalytics {
  totalLessonsCompleted: number;
  totalChallengesCompleted: number;
  totalProjects: number;
  totalXP: number;
  currentLevel: number;
  streakDays: number;
  lastActivityDate: string | null;
  averageSessionTime: number; // seconds
  totalTimeSpent: number; // seconds
  achievementsUnlocked: number;
  aiInteractionsCount: number;
}

/**
 * Get comprehensive user analytics
 */
export async function getUserAnalytics(userId: string): Promise<{
  success: boolean;
  data?: UserAnalytics;
  error?: string;
}> {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('xp, level, streak_days, last_activity_date')
      .eq('id', userId)
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    // Get lesson completions
    const { data: lessons } = await supabase
      .from('user_lesson_progress')
      .select('id, time_spent_seconds')
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get challenge completions
    const { data: challenges } = await supabase
      .from('user_challenge_progress')
      .select('id, time_spent_seconds')
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    // Get achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId);

    // Get AI interactions
    const { data: aiInteractions } = await supabase
      .from('ai_interactions')
      .select('id')
      .eq('user_id', userId);

    // Calculate totals
    const totalTimeSpent =
      (lessons?.reduce((sum, l) => sum + (l.time_spent_seconds || 0), 0) || 0) +
      (challenges?.reduce((sum, c) => sum + (c.time_spent_seconds || 0), 0) || 0);

    const totalSessions = (lessons?.length || 0) + (challenges?.length || 0);
    const averageSessionTime = totalSessions > 0 ? totalTimeSpent / totalSessions : 0;

    const analytics: UserAnalytics = {
      totalLessonsCompleted: lessons?.length || 0,
      totalChallengesCompleted: challenges?.length || 0,
      totalProjects: projects?.length || 0,
      totalXP: userData.xp || 0,
      currentLevel: userData.level || 1,
      streakDays: userData.streak_days || 0,
      lastActivityDate: userData.last_activity_date,
      averageSessionTime: Math.round(averageSessionTime),
      totalTimeSpent,
      achievementsUnlocked: achievements?.length || 0,
      aiInteractionsCount: aiInteractions?.length || 0,
    };

    return { success: true, data: analytics };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Track user activity (update last_activity_date and streak)
 */
export async function trackUserActivity(userId: string): Promise<{
  success: boolean;
  streakUpdated?: boolean;
  newStreak?: number;
  error?: string;
}> {
  try {
    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('last_activity_date, streak_days')
      .eq('id', userId)
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastActivity = userData.last_activity_date?.split('T')[0];

    let newStreak = userData.streak_days || 0;
    let streakUpdated = false;

    // Calculate streak
    if (!lastActivity) {
      // First activity
      newStreak = 1;
      streakUpdated = true;
    } else if (lastActivity !== today) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const daysDiff = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        newStreak += 1;
        streakUpdated = true;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
        streakUpdated = true;
      }
      // Same day = no change
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_activity_date: new Date().toISOString(),
        streak_days: newStreak,
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, streakUpdated, newStreak };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(
  type: 'xp' | 'projects' | 'streak',
  limit: number = 100
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    let query = supabase
      .from('users')
      .select('id, full_name, avatar_url, xp, level, streak_days')
      .neq('role', 'guest')
      .limit(limit);

    if (type === 'xp') {
      query = query.order('xp', { ascending: false });
    } else if (type === 'streak') {
      query = query.order('streak_days', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    // For projects, need to count from projects table
    if (type === 'projects') {
      const usersWithProjects = await Promise.all(
        (data || []).map(async (user) => {
          const { data: projects } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_published', true);

          return {
            ...user,
            projectCount: projects?.length || 0,
          };
        })
      );

      usersWithProjects.sort((a, b) => b.projectCount - a.projectCount);
      return { success: true, data: usersWithProjects.slice(0, limit) };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Record XP transaction
 */
export async function recordXPTransaction(params: {
  userId: string;
  amount: number;
  source: 'lesson' | 'challenge' | 'project' | 'achievement' | 'daily_streak' | 'boss_battle';
  sourceId?: string;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert transaction
    const { error: insertError } = await supabase.from('xp_transactions').insert({
      user_id: params.userId,
      amount: params.amount,
      source: params.source,
      source_id: params.sourceId,
      description: params.description,
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Update user's total XP
    const { data: userData } = await supabase
      .from('users')
      .select('xp')
      .eq('id', params.userId)
      .single();

    const newXP = (userData?.xp || 0) + params.amount;

    const { error: updateError } = await supabase
      .from('users')
      .update({ xp: newXP })
      .eq('id', params.userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

