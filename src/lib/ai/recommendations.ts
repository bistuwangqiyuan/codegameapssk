/**
 * Personalized Learning Recommendations
 * Generates AI-powered learning path recommendations based on user progress
 */

import { supabase } from '@/lib/supabase/client';
import type { Lesson, Challenge } from '@/types/entities';

export interface Recommendation {
  type: 'lesson' | 'challenge' | 'review' | 'practice';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  xpReward: number;
  href: string;
  priority: number; // 1-5, higher is more important
  reason: string;
}

/**
 * Get personalized learning recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: string
): Promise<{
  success: boolean;
  data?: Recommendation[];
  error?: string;
}> {
  try {
    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('xp, level, streak_days, last_activity_date')
      .eq('id', userId)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    const recommendations: Recommendation[] = [];

    // 1. Continue current lesson (highest priority)
    const { data: inProgressLessons } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id, lessons(*)')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .limit(1);

    if (inProgressLessons && inProgressLessons.length > 0) {
      const lesson = inProgressLessons[0].lessons as any;
      recommendations.push({
        type: 'lesson',
        title: `Continue: ${lesson.title}`,
        description: 'Pick up where you left off',
        difficulty: 'medium',
        estimatedTime: lesson.estimated_duration,
        xpReward: lesson.xp_reward,
        href: `/learn/${lesson.level_id}/${lesson.slug}`,
        priority: 5,
        reason: 'You started this lesson. Finish it to gain momentum!',
      });
    }

    // 2. Next lesson in sequence
    const { data: nextLesson } = await supabase.rpc('get_next_available_lesson', {
      p_user_id: userId,
    });

    if (nextLesson && nextLesson.length > 0) {
      const lesson = nextLesson[0];
      recommendations.push({
        type: 'lesson',
        title: `Next up: ${lesson.title}`,
        description: lesson.description,
        difficulty: 'medium',
        estimatedTime: lesson.estimated_duration,
        xpReward: lesson.xp_reward,
        href: `/learn/${lesson.level_id}/${lesson.slug}`,
        priority: 4,
        reason: 'The next lesson in your learning path',
      });
    }

    // 3. Practice challenges for completed lessons
    const { data: completedLessons } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(5);

    if (completedLessons && completedLessons.length > 0) {
      const lessonIds = completedLessons.map((l) => l.lesson_id);

      const { data: incompleteChallenges } = await supabase
        .from('challenges')
        .select('*, lessons(title, level_id)')
        .in('lesson_id', lessonIds)
        .not(
          'id',
          'in',
          `(SELECT challenge_id FROM user_challenge_progress WHERE user_id = '${userId}' AND status = 'completed')`
        )
        .limit(3);

      if (incompleteChallenges && incompleteChallenges.length > 0) {
        incompleteChallenges.forEach((challenge: any) => {
          recommendations.push({
            type: 'challenge',
            title: challenge.title,
            description: challenge.problem_statement,
            difficulty: challenge.difficulty,
            estimatedTime: challenge.time_limit ? challenge.time_limit / 60 : 15,
            xpReward: challenge.xp_reward,
            href: `/sandbox?challenge=${challenge.id}`,
            priority: 3,
            reason: `Practice what you learned in "${challenge.lessons.title}"`,
          });
        });
      }
    }

    // 4. Review weak areas (challenges with low scores)
    const { data: weakChallenges } = await supabase
      .from('user_challenge_progress')
      .select('challenge_id, score, challenges(*, lessons(title, level_id))')
      .eq('user_id', userId)
      .lt('score', 70)
      .limit(2);

    if (weakChallenges && weakChallenges.length > 0) {
      weakChallenges.forEach((item: any) => {
        const challenge = item.challenges;
        recommendations.push({
          type: 'review',
          title: `Review: ${challenge.title}`,
          description: 'Improve your score on this challenge',
          difficulty: challenge.difficulty,
          estimatedTime: 10,
          xpReward: Math.round(challenge.xp_reward * 0.5),
          href: `/sandbox?challenge=${challenge.id}`,
          priority: 2,
          reason: `Your score was ${item.score}%. Let's improve it!`,
        });
      });
    }

    // 5. Daily streak bonus
    const lastActivity = userData.last_activity_date
      ? new Date(userData.last_activity_date)
      : null;
    const today = new Date();
    const daysSinceLastActivity = lastActivity
      ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastActivity === 1 || daysSinceLastActivity === 0) {
      recommendations.push({
        type: 'practice',
        title: '🔥 Keep your streak alive!',
        description: `You're on a ${userData.streak_days}-day streak. Complete any lesson to continue!`,
        difficulty: 'easy',
        estimatedTime: 15,
        xpReward: 50,
        href: '/learn',
        priority: 5,
        reason: 'Consistency is key to mastering programming',
      });
    }

    // Sort by priority (descending)
    recommendations.sort((a, b) => b.priority - a.priority);

    return {
      success: true,
      data: recommendations.slice(0, 5), // Return top 5
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get recommended learning path based on user interests
 */
export async function getRecommendedPath(
  interests: string[]
): Promise<{
  success: boolean;
  data?: { levelId: string; levelTitle: string; reason: string }[];
  error?: string;
}> {
  try {
    // Simple interest-based path recommendation
    const paths: Record<
      string,
      { levelId: string; levelTitle: string; reason: string }[]
    > = {
      design: [
        {
          levelId: 'level-2',
          levelTitle: 'CSS Styling Fundamentals',
          reason: 'Perfect for visual designers learning code',
        },
      ],
      interactivity: [
        {
          levelId: 'level-3',
          levelTitle: 'JavaScript Basics',
          reason: 'Build interactive experiences',
        },
      ],
      'web-apps': [
        {
          levelId: 'level-4',
          levelTitle: 'DOM Manipulation',
          reason: 'Create dynamic web applications',
        },
      ],
    };

    const recommendations = interests.flatMap((interest) => paths[interest] || []);

    return {
      success: true,
      data: recommendations,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

