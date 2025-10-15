/**
 * Level Unlock Logic
 * Determines if a user can access a specific level
 */

import { supabase } from '@/lib/supabase/client';
import type { LearningLevel } from '@/types/entities';
import { calculateLevel } from './xp-calculator';

/**
 * Check if a level is unlocked for a user
 */
export async function isLevelUnlocked(
  levelId: string,
  userId: string
): Promise<{
  unlocked: boolean;
  reason?: string;
  userLevel?: number;
  requiredLevel?: number;
}> {
  try {
    // Get level details
    const { data: level, error: levelError } = await supabase
      .from('levels')
      .select('level_number, xp_required')
      .eq('id', levelId)
      .single();

    if (levelError || !level) {
      return {
        unlocked: false,
        reason: 'Level not found',
      };
    }

    // Level 1 is always unlocked
    if (level.level_number === 1) {
      return { unlocked: true };
    }

    // Get user's current XP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return {
        unlocked: false,
        reason: 'User not found',
      };
    }

    // Check if user has enough XP
    const userLevelInfo = calculateLevel(userData.xp || 0);
    const hasEnoughXP = userData.xp >= level.xp_required;

    if (!hasEnoughXP) {
      return {
        unlocked: false,
        reason: `Need ${level.xp_required - userData.xp} more XP to unlock this level`,
        userLevel: userLevelInfo.level,
        requiredLevel: level.level_number,
      };
    }

    // Check if previous level is completed
    const previousLevelNumber = level.level_number - 1;

    if (previousLevelNumber > 0) {
      const { data: previousLevel } = await supabase
        .from('levels')
        .select('id')
        .eq('level_number', previousLevelNumber)
        .single();

      if (previousLevel) {
        // Check if all lessons in previous level are completed
        const { data: previousLessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('level_id', previousLevel.id)
          .eq('is_published', true);

        if (previousLessons && previousLessons.length > 0) {
          const { data: completedLessons } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .in(
              'lesson_id',
              previousLessons.map((l) => l.id)
            );

          const allCompleted = (completedLessons?.length || 0) === previousLessons.length;

          if (!allCompleted) {
            return {
              unlocked: false,
              reason: `Complete all lessons in Level ${previousLevelNumber} first`,
              userLevel: userLevelInfo.level,
              requiredLevel: level.level_number,
            };
          }
        }
      }
    }

    return {
      unlocked: true,
      userLevel: userLevelInfo.level,
    };
  } catch (error) {
    console.error('Level unlock check error:', error);
    return {
      unlocked: false,
      reason: 'Error checking level unlock status',
    };
  }
}

/**
 * Get all unlocked levels for a user
 */
export async function getUnlockedLevels(userId: string): Promise<{
  success: boolean;
  data?: LearningLevel[];
  error?: string;
}> {
  try {
    // Get all levels
    const { data: allLevels, error: levelsError } = await supabase
      .from('levels')
      .select('*')
      .order('level_number', { ascending: true });

    if (levelsError) {
      return { success: false, error: levelsError.message };
    }

    // Check unlock status for each level
    const unlockedLevels: LearningLevel[] = [];

    for (const level of allLevels || []) {
      const unlockStatus = await isLevelUnlocked(level.id, userId);
      if (unlockStatus.unlocked) {
        unlockedLevels.push(level as LearningLevel);
      }
    }

    return { success: true, data: unlockedLevels };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get level progress for a user
 */
export async function getLevelProgress(
  levelId: string,
  userId: string
): Promise<{
  success: boolean;
  data?: {
    totalLessons: number;
    completedLessons: number;
    totalChallenges: number;
    completedChallenges: number;
    progressPercentage: number;
  };
  error?: string;
}> {
  try {
    // Get all lessons in level
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('level_id', levelId)
      .eq('is_published', true);

    const totalLessons = lessons?.length || 0;

    // Get completed lessons
    const { data: completedLessonsData } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in(
        'lesson_id',
        lessons?.map((l) => l.id) || []
      );

    const completedLessons = completedLessonsData?.length || 0;

    // Get all challenges in level
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id')
      .in(
        'lesson_id',
        lessons?.map((l) => l.id) || []
      );

    const totalChallenges = challenges?.length || 0;

    // Get completed challenges
    const { data: completedChallengesData } = await supabase
      .from('user_challenge_progress')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in(
        'challenge_id',
        challenges?.map((c) => c.id) || []
      );

    const completedChallenges = completedChallengesData?.length || 0;

    // Calculate overall progress
    const totalItems = totalLessons + totalChallenges;
    const completedItems = completedLessons + completedChallenges;
    const progressPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      success: true,
      data: {
        totalLessons,
        completedLessons,
        totalChallenges,
        completedChallenges,
        progressPercentage,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

