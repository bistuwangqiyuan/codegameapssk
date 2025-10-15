// Domain entity types for GameCode Lab

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  userType: 'guest' | 'student' | 'teacher' | 'admin';
  role: 'guest' | 'student' | 'teacher' | 'admin'; // Alias for userType
  registrationDate: Date;
  currentLevel: number;
  totalXP: number;
  xp: number; // Alias for totalXP
  level: number; // Alias for currentLevel
  coinBalance: number;
  coins: number; // Alias for coinBalance
  streak_days: number;
  last_activity_date?: string;
  selectedLanguage: 'en' | 'zh';
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProgressSnapshot {
  xp: number;
  level: number;
  completed_lessons: string[];
  completed_challenges: string[];
  projects: string[];
  achievements: string[];
}

export interface GuestTrial {
  id: string;
  user_id: string;
  guestId: string; // Alias for user_id
  client_token: string;
  started_at: string;
  createdAt: Date; // Parsed version
  expires_at: string;
  expiresAt: Date; // Parsed version
  is_migrated: boolean;
  progress_snapshot?: ProgressSnapshot;
  progressSnapshot: Record<string, unknown>; // Alias
  recovery_token?: string;
  lastActivity: Date;
  migratedAt?: Date;
  migratedToUserId?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// User Story 2: Learning Path + AI Tutoring
// ============================================================================

export interface LearningPath {
  id: string;
  name: string;
  title: string; // Alias
  description: string;
  sequence_order: number;
  sequenceOrder: number; // Alias
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningLevel {
  id: string;
  learning_path_id: string;
  learningPathId: string; // Alias
  level_number: number;
  levelNumber: number; // Alias
  title: string;
  description: string;
  xp_required: number;
  xpRequired: number; // Alias
  xp_to_next: number;
  unlocked_features: string[];
  unlockedFeatures: string[]; // Alias
  badge_icon: string;
  badge_color: string;
  unlock_criteria: Record<string, unknown>;
  unlockCriteria: Record<string, unknown>; // Alias
  sequence_order: number;
  sequenceOrder: number; // Alias
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  level_id: string;
  levelId: string; // Alias
  title: string;
  slug: string;
  description: string;
  learning_objectives: string[];
  learningObjectives: string[]; // Alias
  instructional_content: string; // Markdown
  instructionalContent: string; // Alias
  code_examples?: string; // JSON stringified
  hints?: string[];
  estimated_duration: number; // minutes
  estimatedDuration: number; // Alias
  sequence_order: number;
  sequenceOrder: number; // Alias
  xp_reward: number;
  xpReward: number; // Alias
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  lesson_id: string;
  lessonId: string; // Alias
  title: string;
  problem_statement: string;
  problemStatement: string; // Alias
  starter_code?: string;
  starterCode?: string; // Alias
  solution_code?: string;
  test_cases: TestCase[];
  testCases: TestCase[]; // Alias
  validation_criteria: Record<string, unknown>;
  validationCriteria: Record<string, unknown>; // Alias
  xp_reward: number;
  xpReward: number; // Alias
  coin_reward: number;
  coinReward: number; // Alias
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit?: number; // seconds
  sequence_order: number;
  sequenceOrder: number; // Alias
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id?: string;
  input: string;
  expected_output: string;
  expectedOutput: string; // Alias
  description?: string;
  is_hidden?: boolean; // Hidden test cases for validation
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: 'lesson' | 'challenge' | 'project' | 'achievement' | 'daily_streak' | 'boss_battle';
  source_id?: string;
  description: string;
  created_at: string;
}

export interface Project {
  id: string;
  userId?: string;
  guestId?: string;
  projectName: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  isPublished: boolean;
  isGuest: boolean;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  achievementType: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  unlockCriteria: Record<string, unknown>;
  xpBonus: number;
}

export interface AIInteraction {
  id: string;
  user_id?: string;
  userId?: string; // Alias
  guest_id?: string;
  guestId?: string; // Alias
  interaction_type: 'feedback' | 'hint' | 'chat' | 'explanation' | 'debug';
  interactionType: 'feedback' | 'hint' | 'chat' | 'explanation' | 'debug'; // Alias
  user_query: string;
  userQuery: string; // Alias
  ai_response: string;
  aiResponse: string; // Alias
  context_code?: string;
  contextCode?: string; // Alias
  context_lesson_id?: string;
  context_challenge_id?: string;
  provider: string;
  model?: string;
  response_time?: number; // ms
  responseTime?: number; // Alias
  helpful_rating?: -1 | 0 | 1; // Thumbs down, neutral, thumbs up
  helpfulRating?: -1 | 0 | 1; // Alias
  tokens_used?: number;
  created_at: string;
  createdAt: Date; // Alias
}

export interface BossChallenge {
  id: string;
  difficulty: 'bronze' | 'silver' | 'gold';
  timeLimit: number; // seconds
  generatedProblem: string;
  testCases: TestCase[];
  scoringRubric: Record<string, unknown>;
  minLevel: number;
}

export interface Course {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  authorUserId: string;
  targetProjectId: string;
  commentText: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  totalXP: number;
  currentLevel: number;
  coinBalance: number;
  projectCount: number;
  xpRank: number;
  projectRank: number;
}

