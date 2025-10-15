/**
 * XP Calculation Logic
 * Handles XP rewards, level progression, and achievement tracking
 */

import type { Level } from '@/types/entities';

// XP reward configuration
export const XP_REWARDS = {
  lesson_complete: 50,
  challenge_complete: 100,
  challenge_perfect: 150, // No hints, first try
  project_complete: 200,
  daily_streak: 25,
  achievement_unlock: 50,
  boss_battle_win: 300,
  boss_battle_perfect: 500,
} as const;

// Level progression (10 levels total)
export const LEVEL_PROGRESSION: Level[] = [
  { level_number: 1, title: 'Newbie Coder', xp_required: 0, xp_to_next: 100, unlocked_features: [], badge_icon: '🌱', badge_color: '#10b981' },
  { level_number: 2, title: 'HTML Novice', xp_required: 100, xp_to_next: 250, unlocked_features: ['css_basics'], badge_icon: '🌿', badge_color: '#3b82f6' },
  { level_number: 3, title: 'CSS Stylist', xp_required: 350, xp_to_next: 500, unlocked_features: ['js_basics', 'themes'], badge_icon: '🎨', badge_color: '#8b5cf6' },
  { level_number: 4, title: 'JS Apprentice', xp_required: 850, xp_to_next: 750, unlocked_features: ['dom_manipulation', 'challenges'], badge_icon: '⚡', badge_color: '#f59e0b' },
  { level_number: 5, title: 'DOM Master', xp_required: 1600, xp_to_next: 1000, unlocked_features: ['projects', 'community'], badge_icon: '🔥', badge_color: '#ef4444' },
  { level_number: 6, title: 'Web Builder', xp_required: 2600, xp_to_next: 1500, unlocked_features: ['boss_battles'], badge_icon: '🏗️', badge_color: '#06b6d4' },
  { level_number: 7, title: 'Code Ninja', xp_required: 4100, xp_to_next: 2000, unlocked_features: ['advanced_projects'], badge_icon: '🥷', badge_color: '#6366f1' },
  { level_number: 8, title: 'Elite Developer', xp_required: 6100, xp_to_next: 2500, unlocked_features: ['teacher_mode'], badge_icon: '👑', badge_color: '#a855f7' },
  { level_number: 9, title: 'Code Architect', xp_required: 8600, xp_to_next: 3000, unlocked_features: ['custom_courses'], badge_icon: '🏛️', badge_color: '#ec4899' },
  { level_number: 10, title: 'Web Legend', xp_required: 11600, xp_to_next: 0, unlocked_features: ['all'], badge_icon: '🌟', badge_color: '#f97316' },
];

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): {
  level: number;
  levelData: Level;
  progress: number; // 0-100 percentage to next level
  xpToNext: number;
} {
  let currentLevel = LEVEL_PROGRESSION[0];
  
  for (let i = LEVEL_PROGRESSION.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_PROGRESSION[i].xp_required) {
      currentLevel = LEVEL_PROGRESSION[i];
      break;
    }
  }

  const xpInCurrentLevel = xp - currentLevel.xp_required;
  const progress = currentLevel.xp_to_next > 0 
    ? Math.min((xpInCurrentLevel / currentLevel.xp_to_next) * 100, 100)
    : 100;
  const xpToNext = Math.max(currentLevel.xp_to_next - xpInCurrentLevel, 0);

  return {
    level: currentLevel.level_number,
    levelData: currentLevel,
    progress,
    xpToNext,
  };
}

/**
 * Calculate XP reward for lesson completion
 */
export function calculateLessonXP(params: {
  timeSpentSeconds: number;
  hintsUsed: number;
  attempts: number;
}): number {
  let xp = XP_REWARDS.lesson_complete;

  // Bonus for fast completion (< 5 minutes)
  if (params.timeSpentSeconds < 300) {
    xp += 10;
  }

  // Penalty for excessive hints (cap at -20 XP)
  xp -= Math.min(params.hintsUsed * 5, 20);

  // First-try bonus
  if (params.attempts === 1) {
    xp += 15;
  }

  return Math.max(xp, 10); // Minimum 10 XP
}

/**
 * Calculate XP reward for challenge completion
 */
export function calculateChallengeXP(params: {
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpentSeconds: number;
  hintsUsed: number;
  attempts: number;
  testsPassed: number;
  totalTests: number;
}): number {
  const baseLevelXP = {
    easy: 80,
    medium: 120,
    hard: 180,
  };

  let xp = baseLevelXP[params.difficulty];

  // Perfect score bonus (all tests passed, no hints, first try)
  if (
    params.testsPassed === params.totalTests &&
    params.hintsUsed === 0 &&
    params.attempts === 1
  ) {
    return XP_REWARDS.challenge_perfect;
  }

  // Tests passed ratio
  const passRatio = params.testsPassed / params.totalTests;
  xp *= passRatio;

  // Hints penalty
  xp -= Math.min(params.hintsUsed * 10, 40);

  // Attempts penalty
  if (params.attempts > 1) {
    xp *= Math.max(1 - (params.attempts - 1) * 0.1, 0.5);
  }

  return Math.max(Math.round(xp), 20); // Minimum 20 XP
}

/**
 * Calculate XP reward for project completion
 */
export function calculateProjectXP(params: {
  linesOfCode: number;
  complexity: 'simple' | 'moderate' | 'complex';
  aiReviewScore: number; // 0-100
}): number {
  const baseXP = XP_REWARDS.project_complete;
  const complexityMultiplier = {
    simple: 1.0,
    moderate: 1.3,
    complex: 1.7,
  };

  let xp = baseXP * complexityMultiplier[params.complexity];

  // AI review score bonus (up to +50%)
  const reviewBonus = (params.aiReviewScore / 100) * 0.5;
  xp *= (1 + reviewBonus);

  // Code quality bonus for reasonable LOC
  if (params.linesOfCode >= 50 && params.linesOfCode <= 500) {
    xp += 50;
  }

  return Math.round(xp);
}

/**
 * Check if level-up occurred after XP gain
 */
export function checkLevelUp(oldXP: number, newXP: number): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newLevelData?: Level;
} {
  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);

  return {
    leveledUp: newLevel.level > oldLevel.level,
    oldLevel: oldLevel.level,
    newLevel: newLevel.level,
    newLevelData: newLevel.level > oldLevel.level ? newLevel.levelData : undefined,
  };
}

/**
 * Get unlocked features for a level
 */
export function getUnlockedFeatures(level: number): string[] {
  const levelData = LEVEL_PROGRESSION.find(l => l.level_number === level);
  if (!levelData) return [];

  // Accumulate all features up to current level
  const allFeatures: string[] = [];
  for (let i = 0; i <= level - 1 && i < LEVEL_PROGRESSION.length; i++) {
    allFeatures.push(...LEVEL_PROGRESSION[i].unlocked_features);
  }

  return Array.from(new Set(allFeatures));
}

