-- GameCode Lab Initial Database Schema
-- Generated: 2025-10-15
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (
        user_type IN ('guest', 'student', 'teacher', 'admin')
    ) DEFAULT 'student',
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    coin_balance INTEGER NOT NULL DEFAULT 0,
    selected_language TEXT NOT NULL DEFAULT 'en' CHECK (selected_language IN ('en', 'zh')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Guest trials table
CREATE TABLE IF NOT EXISTS guest_trials (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress_snapshot JSONB DEFAULT '{}',
    migrated_at TIMESTAMPTZ,
    migrated_to_user_id UUID REFERENCES users(id) ON DELETE
    SET NULL
);
-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Levels table
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    unlock_criteria JSONB DEFAULT '{}',
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(learning_path_id, level_number)
);
-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    learning_objectives TEXT [],
    instructional_content TEXT,
    estimated_duration INTEGER,
    -- in minutes
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    problem_statement TEXT NOT NULL,
    starter_code TEXT,
    test_cases JSONB NOT NULL DEFAULT '[]',
    validation_criteria JSONB NOT NULL DEFAULT '{}',
    xp_reward INTEGER NOT NULL DEFAULT 10,
    coin_reward INTEGER NOT NULL DEFAULT 5,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_trials(guest_id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER NOT NULL DEFAULT 0,
    -- in seconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_or_guest CHECK (
        user_id IS NOT NULL
        OR guest_id IS NOT NULL
    ),
    UNIQUE(user_id, lesson_id),
    UNIQUE(guest_id, lesson_id)
);
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_trials(guest_id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    html_code TEXT,
    css_code TEXT,
    js_code TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_guest BOOLEAN NOT NULL DEFAULT false,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_or_guest_project CHECK (
        user_id IS NOT NULL
        OR guest_id IS NOT NULL
    )
);
-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    achievement_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    unlock_criteria JSONB NOT NULL DEFAULT '{}',
    xp_bonus INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(achievement_type)
);
-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);
-- AI interactions table
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_trials(guest_id) ON DELETE CASCADE,
    user_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context_code TEXT,
    provider TEXT NOT NULL,
    response_time INTEGER,
    -- in milliseconds
    helpful_rating INTEGER CHECK (helpful_rating IN (-1, 0, 1)),
    -- -1: thumbs down, 0: no rating, 1: thumbs up
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_or_guest_ai CHECK (
        user_id IS NOT NULL
        OR guest_id IS NOT NULL
    )
);
-- Boss challenges table
CREATE TABLE IF NOT EXISTS boss_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('bronze', 'silver', 'gold')),
    time_limit INTEGER NOT NULL,
    -- in seconds
    generated_problem TEXT NOT NULL,
    test_cases JSONB NOT NULL DEFAULT '[]',
    scoring_rubric JSONB NOT NULL DEFAULT '{}',
    min_level INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Boss attempts table
CREATE TABLE IF NOT EXISTS boss_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    boss_challenge_id UUID NOT NULL REFERENCES boss_challenges(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    score INTEGER NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
    xp_earned INTEGER NOT NULL,
    completed_in INTEGER NOT NULL,
    -- time taken in seconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Courses table (teacher-created)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(course_id, student_id)
);
-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Leaderboard view (materialized for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT u.id,
    u.total_xp,
    u.current_level,
    u.coin_balance,
    COUNT(DISTINCT p.id) as project_count,
    RANK() OVER (
        ORDER BY u.total_xp DESC
    ) as xp_rank,
    RANK() OVER (
        ORDER BY COUNT(DISTINCT p.id) DESC
    ) as project_rank
FROM users u
    LEFT JOIN projects p ON u.id = p.user_id
    AND p.is_published = true
WHERE u.user_type IN ('student', 'teacher')
GROUP BY u.id,
    u.total_xp,
    u.current_level,
    u.coin_balance;
-- Create indexes for performance
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX idx_guest_trials_expires_at ON guest_trials(expires_at);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_guest_id ON user_progress(guest_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_published ON projects(is_published);
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_guest_id ON ai_interactions(guest_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at DESC);
CREATE INDEX idx_comments_target_project_id ON comments(target_project_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
-- Refresh leaderboard materialized view
CREATE UNIQUE INDEX ON leaderboard (id);