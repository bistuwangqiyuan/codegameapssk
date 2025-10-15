/**
 * Progress Store
 * Zustand store for managing user learning progress
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lesson, Challenge, LearningLevel } from '@/types/entities';

interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number; // 0-100
  timeSpent: number; // seconds
  lastAccessedAt?: string;
}

interface ChallengeProgress {
  challengeId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  attempts: number;
  bestScore: number; // 0-100
  code?: string;
  lastAttemptAt?: string;
}

interface ProgressState {
  // Current context
  currentLevelId: string | null;
  currentLessonId: string | null;
  currentChallengeId: string | null;

  // Progress tracking
  lessons: Record<string, LessonProgress>;
  challenges: Record<string, ChallengeProgress>;

  // Stats
  totalXP: number;
  currentLevel: number;
  completedLessons: number;
  completedChallenges: number;

  // Actions
  setCurrentLevel: (levelId: string) => void;
  setCurrentLesson: (lessonId: string) => void;
  setCurrentChallenge: (challengeId: string) => void;

  startLesson: (lessonId: string) => void;
  updateLessonProgress: (lessonId: string, progress: number, timeSpent: number) => void;
  completeLesson: (lessonId: string, xpEarned: number) => void;

  startChallenge: (challengeId: string) => void;
  submitChallenge: (challengeId: string, score: number, code: string) => void;
  completeChallenge: (challengeId: string, score: number, xpEarned: number) => void;

  addXP: (amount: number) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLevelId: null,
      currentLessonId: null,
      currentChallengeId: null,
      lessons: {},
      challenges: {},
      totalXP: 0,
      currentLevel: 1,
      completedLessons: 0,
      completedChallenges: 0,

      // Context setters
      setCurrentLevel: (levelId) => set({ currentLevelId: levelId }),
      setCurrentLesson: (lessonId) => set({ currentLessonId: lessonId }),
      setCurrentChallenge: (challengeId) => set({ currentChallengeId: challengeId }),

      // Lesson progress
      startLesson: (lessonId) => {
        const { lessons } = get();
        set({
          lessons: {
            ...lessons,
            [lessonId]: {
              lessonId,
              status: 'in_progress',
              progress: 0,
              timeSpent: 0,
              lastAccessedAt: new Date().toISOString(),
            },
          },
        });
      },

      updateLessonProgress: (lessonId, progress, timeSpent) => {
        const { lessons } = get();
        const existing = lessons[lessonId];
        set({
          lessons: {
            ...lessons,
            [lessonId]: {
              ...existing,
              progress,
              timeSpent: (existing?.timeSpent || 0) + timeSpent,
              lastAccessedAt: new Date().toISOString(),
            },
          },
        });
      },

      completeLesson: (lessonId, xpEarned) => {
        const { lessons, completedLessons, totalXP } = get();
        const existing = lessons[lessonId];
        const wasNotCompleted = existing?.status !== 'completed';

        set({
          lessons: {
            ...lessons,
            [lessonId]: {
              ...existing,
              status: 'completed',
              progress: 100,
              lastAccessedAt: new Date().toISOString(),
            },
          },
          completedLessons: wasNotCompleted ? completedLessons + 1 : completedLessons,
          totalXP: totalXP + xpEarned,
        });
      },

      // Challenge progress
      startChallenge: (challengeId) => {
        const { challenges } = get();
        const existing = challenges[challengeId];
        set({
          challenges: {
            ...challenges,
            [challengeId]: {
              challengeId,
              status: 'in_progress',
              attempts: (existing?.attempts || 0) + 1,
              bestScore: existing?.bestScore || 0,
              lastAttemptAt: new Date().toISOString(),
            },
          },
        });
      },

      submitChallenge: (challengeId, score, code) => {
        const { challenges } = get();
        const existing = challenges[challengeId];
        const bestScore = Math.max(existing?.bestScore || 0, score);

        set({
          challenges: {
            ...challenges,
            [challengeId]: {
              ...existing,
              bestScore,
              code,
              lastAttemptAt: new Date().toISOString(),
            },
          },
        });
      },

      completeChallenge: (challengeId, score, xpEarned) => {
        const { challenges, completedChallenges, totalXP } = get();
        const existing = challenges[challengeId];
        const wasNotCompleted = existing?.status !== 'completed';

        set({
          challenges: {
            ...challenges,
            [challengeId]: {
              ...existing,
              status: 'completed',
              bestScore: Math.max(existing?.bestScore || 0, score),
              lastAttemptAt: new Date().toISOString(),
            },
          },
          completedChallenges: wasNotCompleted
            ? completedChallenges + 1
            : completedChallenges,
          totalXP: totalXP + xpEarned,
        });
      },

      // XP management
      addXP: (amount) => {
        const { totalXP } = get();
        const newXP = totalXP + amount;

        // Calculate new level (simple formula: level = floor(XP / 1000) + 1)
        const newLevel = Math.floor(newXP / 1000) + 1;

        set({
          totalXP: newXP,
          currentLevel: newLevel,
        });
      },

      // Reset
      resetProgress: () =>
        set({
          currentLevelId: null,
          currentLessonId: null,
          currentChallengeId: null,
          lessons: {},
          challenges: {},
          totalXP: 0,
          currentLevel: 1,
          completedLessons: 0,
          completedChallenges: 0,
        }),
    }),
    {
      name: 'gamecode-progress-storage',
    }
  )
);

