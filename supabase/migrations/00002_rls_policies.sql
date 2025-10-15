-- Row Level Security Policies
-- Generated: 2025-10-15
-- Constitution Requirement: RLS MUST be enabled for all user-facing tables
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boss_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- Users table policies
CREATE POLICY "Users can view their own profile" ON users FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND user_type = 'admin'
        )
    );
-- Guest trials policies
CREATE POLICY "Guest can view own trial" ON guest_trials FOR
SELECT USING (true);
-- Guests don't have auth.uid(), validated by application logic
CREATE POLICY "Guest can update own trial" ON guest_trials FOR
UPDATE USING (true);
-- Validated by application logic with guest_id token
-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress FOR
SELECT USING (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL) -- Guests validated by application
    );
CREATE POLICY "Users can insert own progress" ON user_progress FOR
INSERT WITH CHECK (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL) -- Guests validated by application
    );
CREATE POLICY "Users can update own progress" ON user_progress FOR
UPDATE USING (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL)
    );
CREATE POLICY "Teachers can view enrolled students' progress" ON user_progress FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM course_enrollments ce
                JOIN courses c ON ce.course_id = c.id
            WHERE c.creator_id = auth.uid()
                AND ce.student_id = user_progress.user_id
        )
    );
-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR
SELECT USING (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL)
        OR (is_published = true) -- Anyone can view published projects
    );
CREATE POLICY "Users can insert own projects" ON projects FOR
INSERT WITH CHECK (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL)
    );
CREATE POLICY "Users can update own projects" ON projects FOR
UPDATE USING (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL)
    );
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (
    (user_id = auth.uid())
    OR (guest_id IS NOT NULL)
);
CREATE POLICY "Admins can moderate any project" ON projects FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE id = auth.uid()
            AND user_type = 'admin'
    )
);
-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements FOR
SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON achievements FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE id = auth.uid()
            AND user_type = 'admin'
    )
);
-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "System can grant achievements" ON user_achievements FOR
INSERT WITH CHECK (true);
-- Granted by Edge Functions
-- AI interactions policies
CREATE POLICY "Users can view own AI interactions" ON ai_interactions FOR
SELECT USING (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL)
    );
CREATE POLICY "Users can insert own AI interactions" ON ai_interactions FOR
INSERT WITH CHECK (
        (user_id = auth.uid())
        OR (guest_id IS NOT NULL)
    );
CREATE POLICY "Admins can view all AI interactions" ON ai_interactions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND user_type = 'admin'
        )
    );
-- Boss attempts policies
CREATE POLICY "Users can view own boss attempts" ON boss_attempts FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own boss attempts" ON boss_attempts FOR
INSERT WITH CHECK (user_id = auth.uid());
-- Courses policies
CREATE POLICY "Anyone can view published courses" ON courses FOR
SELECT USING (
        is_published = true
        OR creator_id = auth.uid()
    );
CREATE POLICY "Teachers can create courses" ON courses FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND user_type IN ('teacher', 'admin')
        )
    );
CREATE POLICY "Teachers can update own courses" ON courses FOR
UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Teachers can delete own courses" ON courses FOR DELETE USING (creator_id = auth.uid());
-- Course enrollments policies
CREATE POLICY "Students can view own enrollments" ON course_enrollments FOR
SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can view their course enrollments" ON course_enrollments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM courses
            WHERE id = course_enrollments.course_id
                AND creator_id = auth.uid()
        )
    );
CREATE POLICY "Students can enroll in courses" ON course_enrollments FOR
INSERT WITH CHECK (student_id = auth.uid());
-- Comments policies
CREATE POLICY "Anyone can view comments on published projects" ON comments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM projects
            WHERE id = comments.target_project_id
                AND is_published = true
        )
    );
CREATE POLICY "Authenticated users can create comments" ON comments FOR
INSERT WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "Users can update own comments" ON comments FOR
UPDATE USING (author_user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (author_user_id = auth.uid());
CREATE POLICY "Admins can moderate comments" ON comments FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE id = auth.uid()
            AND user_type = 'admin'
    )
);
-- Helper function for leaderboard refresh (called by cron or manually)
CREATE OR REPLACE FUNCTION refresh_leaderboard() RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
END;
$$;
-- Create scheduled job to refresh leaderboard every 5 minutes
-- Note: Requires pg_cron extension, configure in Supabase dashboard
-- SELECT cron.schedule('refresh-leaderboard', '*/5 * * * *', 'SELECT refresh_leaderboard();');