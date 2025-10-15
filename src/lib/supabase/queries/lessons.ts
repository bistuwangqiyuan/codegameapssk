/**
 * Lesson Queries Service
 * Handles fetching and managing lesson data
 */

import { supabase } from '../client';
import type { Lesson } from '@/types/entities';

/**
 * Get all lessons for a level
 */
export async function getLessonsByLevel(levelId: string): Promise<{
  success: boolean;
  data?: Lesson[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('level_id', levelId)
      .eq('is_published', true)
      .order('sequence_order', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Lesson[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific lesson by ID or slug
 */
export async function getLesson(
  idOrSlug: string,
  bySlug: boolean = false
): Promise<{
  success: boolean;
  data?: Lesson;
  error?: string;
}> {
  try {
    const query = bySlug
      ? supabase.from('lessons').select('*').eq('slug', idOrSlug).single()
      : supabase.from('lessons').select('*').eq('id', idOrSlug).single();

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Lesson };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get lesson with user progress
 */
export async function getLessonWithProgress(
  lessonId: string,
  userId: string
): Promise<{
  success: boolean;
  data?: {
    lesson: Lesson;
    progress: any | null;
    isCompleted: boolean;
  };
  error?: string;
}> {
  try {
    // Get lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError) {
      return { success: false, error: lessonError.message };
    }

    // Get user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    // No error if progress doesn't exist yet
    const isCompleted = progress?.status === 'completed';

    return {
      success: true,
      data: {
        lesson: lesson as Lesson,
        progress: progress || null,
        isCompleted,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get next lesson in sequence
 */
export async function getNextLesson(
  currentLessonId: string
): Promise<{
  success: boolean;
  data?: Lesson | null;
  error?: string;
}> {
  try {
    // Get current lesson to find its level and sequence
    const { data: currentLesson, error: currentError } = await supabase
      .from('lessons')
      .select('level_id, sequence_order')
      .eq('id', currentLessonId)
      .single();

    if (currentError) {
      return { success: false, error: currentError.message };
    }

    // Get next lesson in same level
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('level_id', currentLesson.level_id)
      .eq('is_published', true)
      .gt('sequence_order', currentLesson.sequence_order)
      .order('sequence_order', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is ok
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as Lesson) || null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if lesson is unlocked for user (T077: Sequential progression)
 */
export async function isLessonUnlocked(
  lessonId: string,
  userId: string
): Promise<{
  success: boolean;
  unlocked: boolean;
  reason?: string;
  error?: string;
}> {
  try {
    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('level_id, sequence_order')
      .eq('id', lessonId)
      .single();

    if (lessonError) {
      return { success: false, unlocked: false, error: lessonError.message };
    }

    // First lesson in any level is always unlocked
    if (lesson.sequence_order === 1) {
      return { success: true, unlocked: true };
    }

    // Get previous lessons in the same level
    const { data: previousLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('level_id', lesson.level_id)
      .lt('sequence_order', lesson.sequence_order)
      .eq('is_published', true);

    if (!previousLessons || previousLessons.length === 0) {
      // No previous lessons, this is the first
      return { success: true, unlocked: true };
    }

    // Check if all previous lessons are completed
    const { data: completedLessons } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in(
        'lesson_id',
        previousLessons.map((l) => l.id)
      );

    const allPreviousCompleted =
      (completedLessons?.length || 0) === previousLessons.length;

    if (!allPreviousCompleted) {
      return {
        success: true,
        unlocked: false,
        reason: 'Previous lessons must be completed first',
      };
    }

    return { success: true, unlocked: true };
  } catch (error: any) {
    return { success: false, unlocked: false, error: error.message };
  }
}

/**
 * Mark lesson as started
 */
export async function startLesson(
  lessonId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('user_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: 'in_progress',
        attempts: 1,
        time_spent_seconds: 0,
      },
      {
        onConflict: 'user_id,lesson_id',
      }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

