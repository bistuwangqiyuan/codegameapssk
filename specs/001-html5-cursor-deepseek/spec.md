# Feature Specification: GameCode Lab - 游戏化 HTML5 编程教育平台

**Feature Branch**: `001-html5-cursor-deepseek`  
**Created**: October 15, 2025  
**Status**: Draft  
**Input**: 游戏化 HTML5 编程教育在线网站平台 —— 基于 Cursor + DeepSeek + Supabase + astro 技术栈的智能教育系统

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Guest User Trial Learning Journey (Priority: P1)

A complete beginner visits the platform and immediately starts learning HTML5 basics without registration, progresses through interactive lessons with AI feedback, and experiences the gamification system within the 1-month trial period.

**Why this priority**: This is the core value proposition and primary user acquisition funnel. Without this, the platform cannot demonstrate value or attract users.

**Independent Test**: Can be fully tested by opening the platform in an incognito browser, completing at least one HTML lesson with code execution, receiving AI feedback, and earning experience points - all without creating an account.

**Acceptance Scenarios**:

1. **Given** a new visitor lands on the homepage, **When** they click "Start Learning Now", **Then** they are automatically assigned a temporary account and directed to Level 1 HTML5 basics without any registration form
2. **Given** a guest user is on a lesson page, **When** they write HTML code in the editor and click "Run", **Then** the code executes in a sandboxed preview pane showing the rendered output
3. **Given** a guest user submits code for a challenge, **When** the code is evaluated, **Then** AI assistant "CodeMentor DS" provides natural language feedback on errors or success within 3 seconds
4. **Given** a guest user completes a lesson successfully, **When** the lesson is marked complete, **Then** they receive XP points, see a level-up animation if applicable, and unlock the next lesson
5. **Given** a guest user has been active for 1 month, **When** their trial period expires, **Then** they see a friendly prompt to register to continue learning with all progress preserved

---

### User Story 2 - Progressive Learning Path with AI Tutoring (Priority: P1)

A learner progresses through the structured 5-level curriculum (HTML5 → CSS → JavaScript → DOM → Projects), receiving personalized AI assistance, hints, and explanations at each step.

**Why this priority**: This is the core educational experience that differentiates the platform. Without structured learning paths and AI tutoring, it's just a code editor.

**Independent Test**: Can be tested by completing a full learning path from Level 1 to Level 2, with AI providing explanations, checking code correctness, and offering hints when stuck.

**Acceptance Scenarios**:

1. **Given** a user starts Level 1 (HTML5 basics), **When** they view a lesson, **Then** they see clear learning objectives, example code, and an interactive challenge to complete
2. **Given** a user is stuck on a challenge, **When** they click "Get Hint" or ask the AI assistant a question, **Then** CodeMentor DS provides contextual guidance without giving away the full solution
3. **Given** a user submits incorrect code, **When** the AI evaluates it, **Then** it identifies specific errors, explains why they're wrong, and suggests how to fix them in beginner-friendly language
4. **Given** a user completes all lessons in Level 1, **When** they finish the level assessment, **Then** Level 2 (CSS) unlocks, and they see their progress reflected in the learning path visualization
5. **Given** a user is learning JavaScript (Level 3), **When** they encounter a concept they've forgotten from Level 1, **Then** the AI can explain the prerequisite concept and suggest a review path

---

### User Story 3 - Gamification and Motivation System (Priority: P2)

Users earn experience points (XP), level up from Lv1 to Lv10, unlock achievements, compete on leaderboards, and unlock cosmetic rewards to maintain engagement and motivation.

**Why this priority**: Gamification significantly increases engagement and completion rates but is secondary to core learning functionality.

**Independent Test**: Can be tested by completing multiple lessons, earning XP, leveling up, unlocking an achievement, and viewing the leaderboard independently of other features.

**Acceptance Scenarios**:

1. **Given** a user completes a lesson, **When** the lesson is marked complete, **Then** they receive XP (varying by difficulty), see an animated XP gain indicator, and their progress bar fills toward the next level
2. **Given** a user accumulates enough XP, **When** they reach the level threshold, **Then** a celebration animation plays, they advance from (e.g.) Lv2 to Lv3, and unlock new profile customization options
3. **Given** a user accomplishes a milestone, **When** the milestone criteria is met (e.g., "Complete first lesson", "7-day streak", "Zero-error challenge"), **Then** an achievement badge appears with a congratulatory message
4. **Given** a user views the leaderboard page, **When** the page loads, **Then** they see rankings by XP, challenge completion speed, and project count, with their own rank highlighted
5. **Given** a user earns gold coins through lessons, **When** they visit the rewards shop, **Then** they can spend coins on cosmetic items like editor themes, avatar accessories, or code snippet templates

---

### User Story 4 - Interactive Code Sandbox Environment (Priority: P1)

Users write HTML, CSS, and JavaScript code in a three-panel editor with syntax highlighting, see real-time preview of their work, save projects to their account, and optionally export or deploy their creations.

**Why this priority**: The code sandbox is the core technical infrastructure enabling hands-on learning. Without it, the platform cannot deliver on its promise of practical coding education.

**Independent Test**: Can be tested by writing code in each of the three panels (HTML/CSS/JS), seeing live preview updates, saving a project, and retrieving it later.

**Acceptance Scenarios**:

1. **Given** a user is in the code editor, **When** they type HTML in the HTML panel, **Then** the preview pane updates in real-time (with a short debounce) to show the rendered output
2. **Given** a user writes CSS rules, **When** they apply styles to HTML elements, **Then** the preview immediately reflects the styling changes
3. **Given** a user writes JavaScript code, **When** they add interactivity (e.g., button click handlers), **Then** the preview executes the JavaScript in a secure sandbox without affecting the main page
4. **Given** a user has written code they want to keep, **When** they click "Save Project", **Then** the project is saved to their account with a name and timestamp, retrievable later
5. **Given** a user completes a project, **When** they click "Export" or "Deploy", **Then** they can download the files as a ZIP or get a shareable link to their deployed project

---

### User Story 5 - AI Boss Challenges and Advanced Features (Priority: P3)

Advanced learners face randomized AI-generated coding challenges ("Boss Battles"), complete timed debugging tasks, and receive personalized code optimization suggestions to push their skills.

**Why this priority**: This adds replay value and advanced engagement but is not essential for the core MVP learning experience.

**Independent Test**: Can be tested by triggering an AI Boss challenge, completing it within time limits, and receiving feedback on code efficiency independently of the main learning path.

**Acceptance Scenarios**:

1. **Given** a user reaches Level 4 or higher, **When** they opt into a Boss Challenge, **Then** the AI generates a custom coding problem with specific requirements and a time limit
2. **Given** a user is in a Boss Challenge, **When** the timer counts down, **Then** they see remaining time clearly displayed and receive warnings at 5-minute and 1-minute marks
3. **Given** a user submits their Boss Challenge solution, **When** the AI evaluates it, **Then** it scores on correctness, code quality, and efficiency, awarding bonus XP for high scores
4. **Given** a user's code works but is inefficient, **When** the AI reviews it, **Then** it suggests specific optimizations (e.g., "Consider using CSS Grid instead of nested flexbox") with before/after examples

---

### User Story 6 - Community Project Showcase (Priority: P3)

Users publish completed projects to a community gallery, browse others' work, leave comments and likes, and get featured on daily recommendation lists with AI-generated highlights.

**Why this priority**: Community features drive long-term engagement and retention but are not critical for initial learning value.

**Independent Test**: Can be tested by publishing a project, viewing it in the gallery, liking another user's project, and leaving a comment independently of the learning modules.

**Acceptance Scenarios**:

1. **Given** a user completes a project they're proud of, **When** they click "Publish to Community", **Then** the project appears in the public gallery with a thumbnail, title, description, and author info
2. **Given** a user browses the community gallery, **When** they see projects they like, **Then** they can click a heart icon to like it and leave text comments
3. **Given** the AI reviews community projects daily, **When** it identifies high-quality work, **Then** featured projects appear on the homepage with AI-generated descriptions of what makes them notable
4. **Given** a user views a community project, **When** they find it helpful, **Then** they can fork it to their own account as a starting point for their own work

---

### User Story 7 - Teacher and Admin Capabilities (Priority: P2)

Teachers create custom courses, design lesson challenges, monitor student progress, while admins manage platform settings, moderate content, and configure AI behavior.

**Why this priority**: These roles extend the platform's utility to institutional settings but aren't needed for individual learners in MVP.

**Independent Test**: Can be tested by logging in as a teacher, creating a custom lesson with acceptance criteria, assigning it to students, and viewing their completion status independently.

**Acceptance Scenarios**:

1. **Given** a teacher logs into their account, **When** they navigate to "Create Course", **Then** they see a course builder interface where they can add lessons, set learning objectives, and define completion criteria
2. **Given** a teacher creates a custom challenge, **When** they configure test cases, **Then** student submissions are automatically graded against these criteria with pass/fail feedback
3. **Given** a teacher views their student dashboard, **When** the page loads, **Then** they see each student's progress, XP earned, time spent, and areas where they're struggling
4. **Given** an admin reviews flagged community content, **When** they identify violations, **Then** they can hide, delete, or warn users about inappropriate projects or comments
5. **Given** an admin configures AI settings, **When** they adjust parameters (hint frequency, difficulty scaling), **Then** these settings apply globally or to specific user cohorts

---

### Edge Cases

- **What happens when the user's 1-month trial expires exactly while they're in the middle of a lesson?** System should save their progress, show the registration prompt non-intrusively (e.g., banner notification), but allow them to finish the current lesson before requiring action.

- **How does the system handle infinite loops or resource-intensive JavaScript in the code sandbox?** The sandbox must have execution time limits (e.g., 5 seconds) and memory constraints, automatically terminating runaway code with a clear error message explaining what happened.

- **What if a guest user clears their browser cookies/local storage before the trial ends?** System should generate a new temporary account, but display a message explaining that previous progress cannot be recovered unless they register. Consider offering anonymous recovery via a unique trial code.

- **How does the AI handle non-English code comments or questions from users?** [NEEDS CLARIFICATION: Should the AI support multilingual interactions beyond Chinese and English, or are these the only two languages for MVP?]

- **What happens if the AI API is down or rate-limited?** System should gracefully degrade: show cached hints/explanations where available, allow code execution to continue without AI feedback, and display a clear status message about temporary AI unavailability.

- **How does the leaderboard handle cheating (e.g., users submitting solutions they didn't write)?** System should implement plagiarism detection by comparing code similarity patterns, and flag suspicious submissions for review. First offense = warning, repeated = leaderboard ban.

- **What if a user wants to change their guest account to a registered account after the trial?** System must preserve all progress (XP, achievements, saved projects) when converting guest → registered user via a unique migration token stored in browser storage.

## Requirements _(mandatory)_

### Functional Requirements

**Authentication & User Management**

- **FR-001**: System MUST allow visitors to start learning immediately without registration by auto-generating temporary guest accounts with 30-day expiration
- **FR-002**: System MUST support registered user accounts with email/password authentication
- **FR-003**: System MUST support OAuth authentication via at least 2 providers (e.g., Google, GitHub)
- **FR-004**: System MUST migrate all guest progress (XP, achievements, projects) to a registered account when a guest chooses to register
- **FR-005**: System MUST implement role-based access control for four user types: Guest, Student, Teacher, Admin
- **FR-006**: System MUST track user session activity and learning behavior for analytics purposes

**Learning Content & Curriculum**

- **FR-007**: System MUST provide a structured 5-level learning path: Level 1 (HTML5 basics) → Level 2 (CSS) → Level 3 (JavaScript fundamentals) → Level 4 (DOM manipulation) → Level 5 (Project capstone)
- **FR-008**: Each level MUST contain multiple lessons with clear learning objectives, example code, and completion criteria
- **FR-009**: System MUST enforce sequential progression where Level N+1 unlocks only after completing Level N
- **FR-010**: Each lesson MUST include at least one interactive coding challenge that validates user submissions
- **FR-011**: System MUST store lesson content, challenge definitions, and test cases in a structured database schema

**AI-Powered Learning Assistant**

- **FR-012**: System MUST integrate an AI assistant (named "CodeMentor DS") capable of analyzing user code submissions
- **FR-013**: AI assistant MUST provide natural language feedback on code errors, explaining what's wrong and how to fix it
- **FR-014**: AI assistant MUST offer contextual hints when users request help, without revealing complete solutions
- **FR-015**: AI assistant MUST answer user questions about programming concepts in conversational natural language
- **FR-016**: System MUST generate personalized learning recommendations based on user performance patterns
- **FR-017**: System MUST implement rate limiting on AI API calls to prevent abuse (e.g., max 100 requests per user per day)
- **FR-018**: System MUST support fallback behavior when AI services are unavailable, showing cached responses or predefined hints

**Code Sandbox & Editor**

- **FR-019**: System MUST provide a three-panel code editor for HTML, CSS, and JavaScript with syntax highlighting
- **FR-020**: System MUST render live preview of user code in a secure sandboxed iframe to prevent cross-site scripting
- **FR-021**: System MUST update the preview pane in near real-time (with appropriate debouncing) as users type
- **FR-022**: Sandbox MUST enforce execution limits: maximum 5-second runtime, memory caps, and no access to parent page context
- **FR-023**: System MUST automatically terminate infinite loops or resource-intensive code with clear error messages
- **FR-024**: System MUST support saving user projects with names, timestamps, and associated metadata
- **FR-025**: System MUST allow users to export projects as downloadable ZIP files containing HTML/CSS/JS files
- **FR-026**: System MUST provide one-click deployment option for publishing projects to a publicly accessible URL

**Gamification System**

- **FR-027**: System MUST award experience points (XP) for completed lessons, with amounts scaled by difficulty
- **FR-028**: System MUST implement a 10-level progression system (Lv1 "Novice" to Lv10 "Web Expert") with XP thresholds for each level
- **FR-029**: System MUST award in-platform currency (gold coins) for completing challenges and achieving milestones
- **FR-030**: System MUST unlock achievement badges for specific accomplishments (e.g., "First Success", "7-Day Streak", "Zero Errors")
- **FR-031**: System MUST display user level, XP progress bars, and total coins on the user profile and navigation header
- **FR-032**: System MUST maintain leaderboards ranking users by total XP, challenge completion speed, and project count
- **FR-033**: System MUST provide a rewards shop where users can spend coins on cosmetic items (editor themes, avatars, etc.)
- **FR-034**: System MUST display celebratory animations and visual feedback when users level up or earn achievements

**AI Boss Challenges (Advanced)**

- **FR-035**: System MUST generate randomized coding challenges ("Boss Battles") for users at Level 4 and above
- **FR-036**: Boss challenges MUST include time limits (e.g., 15-30 minutes) and difficulty ratings
- **FR-037**: System MUST evaluate Boss challenge submissions on correctness, code quality, and efficiency
- **FR-038**: System MUST award bonus XP for Boss challenge completions with scoring tiers (Bronze/Silver/Gold)
- **FR-039**: AI MUST provide code optimization suggestions for working but inefficient Boss challenge solutions

**Community & Social Features**

- **FR-040**: System MUST allow users to publish completed projects to a public community gallery
- **FR-041**: Published projects MUST display thumbnail previews, titles, descriptions, author info, and publication dates
- **FR-042**: Users MUST be able to like (heart) and comment on community projects
- **FR-043**: System MUST allow users to fork community projects as starting points for their own work
- **FR-044**: System MUST feature AI-curated daily project recommendations on the homepage
- **FR-045**: AI MUST generate natural language descriptions explaining why featured projects are notable
- **FR-046**: System MUST implement content moderation with admin review of flagged projects/comments

**Teacher & Admin Capabilities**

- **FR-047**: Teachers MUST be able to create custom courses with multiple lessons and custom challenges
- **FR-048**: Teachers MUST be able to define automated test cases for their custom challenges
- **FR-049**: Teachers MUST have access to a dashboard showing student progress, time spent, and performance analytics
- **FR-050**: Admins MUST be able to moderate community content (hide, delete, warn users)
- **FR-051**: Admins MUST be able to configure global AI parameters (hint frequency, difficulty scaling)
- **FR-052**: Admins MUST have access to system health monitoring and AI API usage statistics

**Security & Performance**

- **FR-053**: System MUST authenticate all API requests using JWT tokens
- **FR-054**: System MUST enforce rate limits on all public endpoints to prevent abuse
- **FR-055**: System MUST sanitize and validate all user inputs before storage or execution
- **FR-056**: System MUST implement content security policies to prevent XSS attacks in the sandbox
- **FR-057**: System MUST log all authentication events and security-relevant actions for audit purposes
- **FR-058**: System MUST perform automated database backups at least daily
- **FR-059**: System MUST cache frequently accessed content to minimize database load
- **FR-060**: System MUST optimize page load times to achieve initial render within 2 seconds on standard broadband connections

**Internationalization**

- **FR-061**: System MUST support at least two languages: Chinese (zh-CN) and English (en-US)
- **FR-062**: Users MUST be able to switch interface language via a settings toggle
- **FR-063**: AI assistant MUST respond in the user's selected language preference

### Key Entities

- **User**: Represents any person interacting with the platform; attributes include userType (guest/student/teacher/admin), registrationDate, trialExpirationDate, currentLevel, totalXP, coinBalance, selectedLanguage, preferences
- **LearningPath**: Represents the structured curriculum; contains ordered Levels
- **Level**: Represents a major learning unit (e.g., HTML5 Basics, CSS Styling); contains multiple Lessons, has prerequisites, unlockCriteria
- **Lesson**: Represents a single learning unit; includes learningObjectives, instructionalContent, challenges, estimatedDuration
- **Challenge**: Represents a coding task within a lesson; includes problemStatement, starterCode, testCases, validationCriteria, xpReward, coinReward
- **Project**: Represents user-created work; includes htmlCode, cssCode, jsCode, projectName, creationDate, isPublished, likes, comments
- **Achievement**: Represents earned badges; includes achievementType, unlockCriteria, displayName, iconUrl, xpBonus
- **AIInteraction**: Represents user-AI conversation history; includes userQuery, aiResponse, contextCode, timestamp, responseTime
- **BossChallenge**: Represents AI-generated advanced challenges; includes difficulty, timeLimit, generatedProblem, testCases, scoringRubric
- **Leaderboard**: Represents ranking views; calculated from User XP, challenge completion times, project counts
- **Course**: Represents teacher-created learning content; includes lessons, assignments, enrolledStudents, creator
- **Comment**: Represents user feedback on projects; includes authorUser, targetProject, commentText, timestamp

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Guest users can begin their first lesson within 10 seconds of landing on the platform, with zero registration steps required
- **SC-002**: Code execution in the sandbox produces visible output or error feedback within 2 seconds for 95% of code submissions
- **SC-003**: AI assistant provides natural language feedback on code submissions within 5 seconds for 90% of requests
- **SC-004**: Users complete at least 3 lessons per session on average, indicating engaging content pacing
- **SC-005**: At least 40% of guest users who complete Level 1 return for a second session within 7 days
- **SC-006**: Users successfully complete challenges on their first attempt at least 60% of the time, indicating appropriate difficulty balance
- **SC-007**: The sandbox safely executes and terminates malicious or infinite-loop code within 5 seconds without affecting platform stability
- **SC-008**: Platform supports at least 500 concurrent users with page load times under 3 seconds and no degradation in AI response times
- **SC-009**: Guest-to-registered conversion rate reaches at least 15% before trial expiration
- **SC-010**: Community gallery receives at least 10 new project publications per week after reaching 100 active users
- **SC-011**: AI-generated hints are rated as helpful (thumbs up) by users at least 70% of the time
- **SC-012**: Teacher-created courses are completed by students at rates comparable to or higher than platform-default courses (within 10% completion rate)
- **SC-013**: System maintains 99.5% uptime for core learning features (editor, sandbox, content delivery) over any 30-day period
- **SC-014**: Average user session duration increases by at least 25% after gamification features are introduced compared to baseline
- **SC-015**: Support ticket volume related to "how to start learning" decreases to near zero after guest trial implementation

## Assumptions

- Users have modern web browsers (released within the last 2 years) with JavaScript enabled
- Users have basic literacy in either Chinese or English to understand lesson instructions
- The AI service provider (DeepSeek or fallback options) maintains acceptable uptime (>99%) and response times (<3 seconds average)
- Guest user trial tracking can reliably use browser local storage or cookies for the 30-day period
- Standard web security practices (CSP, iframe sandboxing) are sufficient to safely execute user-provided code
- Teacher users have sufficient technical knowledge to create meaningful coding challenges with test cases
- The platform will initially target individual learners and small educational institutions, not enterprise-scale deployments (thousands of simultaneous users)
- Code challenges focus on client-side web technologies (HTML/CSS/JS) and do not require server-side execution environments in MVP
- Users are motivated by visible progress indicators (XP, levels, badges) and peer comparison (leaderboards)
- The majority of users will access the platform via desktop or laptop computers, with mobile support as a secondary priority

## Dependencies

- External AI API services (DeepSeek, with fallbacks to GLM, Moonshot, Tongyi, etc.) for code analysis and tutoring
- Database service (Supabase) for authentication, data storage, and edge functions
- Third-party OAuth providers (Google, GitHub) for social authentication
- Code editor library (CodeMirror or Monaco Editor) for syntax highlighting and editing features
- Browser iframe sandboxing capabilities for secure code execution
- CDN or static hosting service for fast delivery of editor assets and lesson content
- Email service provider for user notifications and password reset functionality (if using Supabase Auth, this is included)

## Out of Scope

The following are explicitly NOT included in this feature scope:

- **Server-side programming languages**: Teaching Python, Java, C, C++, or any backend languages (noted as future expansion)
- **Multi-user collaborative editing**: Real-time pair programming or shared editing sessions (noted as future expansion)
- **Video content**: Recorded video lectures or live streaming instruction (text and interactive code only)
- **Mobile native apps**: iOS or Android applications (web-responsive design only)
- **Advanced deployment infrastructure**: CI/CD pipelines, custom domain management for deployed projects
- **Payment processing**: Paid subscriptions, premium tiers, or monetization features (all features free in MVP)
- **Advanced analytics dashboards**: Deep learning analytics, predictive modeling of student success
- **Accessibility compliance beyond basic standards**: WCAG AAA compliance, screen reader optimization (WCAG AA is target)
- **Offline mode**: Downloading lessons or working without internet connectivity
- **Certificate issuance**: Official certificates of completion or accreditation
- **WebGPU/3D graphics programming**: Advanced graphics and shader programming (noted as future expansion)
- **AI-generated full projects**: AI creating complete projects from natural language descriptions (only hints, feedback, and evaluation)
- **Integration with external LMS**: SCORM packages, LTI integration with Canvas/Moodle
- **Live customer support chat**: Real-time human support (AI assistant and documentation only)

## Risk Assessment

- **HIGH RISK - AI Service Dependency**: Heavy reliance on external AI API creates single point of failure. **Mitigation**: Implement multiple AI provider fallbacks, cache common responses, design graceful degradation paths.

- **HIGH RISK - Code Sandbox Security**: User-provided code executing in browser could escape sandbox. **Mitigation**: Rigorous CSP policies, iframe sandboxing, execution time/memory limits, regular security audits.

- **MEDIUM RISK - Guest User Progress Loss**: Users clearing browser storage lose all trial progress. **Mitigation**: Generate unique trial recovery codes, store in local storage and offer export option, strongly encourage early registration.

- **MEDIUM RISK - Gamification Ineffectiveness**: Some users may not be motivated by points/badges. **Mitigation**: Make gamification optional/discreet, focus primarily on learning value, gather early user feedback.

- **MEDIUM RISK - AI Quality Variance**: AI-generated hints/feedback may be inaccurate or unhelpful. **Mitigation**: Human review of AI responses, user feedback mechanism (thumbs up/down), curated fallback responses for common scenarios.

- **LOW RISK - Teacher Adoption Challenges**: Teachers may find course creation tools too complex. **Mitigation**: Provide comprehensive documentation, template courses, wizard-based course builders.

- **LOW RISK - Scale Performance**: Sudden user growth could overwhelm infrastructure. **Mitigation**: Design with horizontal scaling in mind, use CDN for static assets, implement caching aggressively, monitor and set up auto-scaling.

## Timeline Considerations

This specification supports phased development:

**Phase 1 - Core Learning MVP** (Priority P1 user stories):

- Guest trial system
- Levels 1-2 (HTML5 + CSS) with basic lessons
- Code sandbox with live preview
- Basic AI feedback integration
- XP and level progression

**Phase 2 - Enhanced Engagement** (Priority P2 user stories):

- Levels 3-5 (JavaScript, DOM, Projects)
- Full gamification (achievements, leaderboard, rewards shop)
- Teacher role and custom courses
- Progress analytics

**Phase 3 - Advanced Features** (Priority P3 user stories):

- AI Boss challenges
- Community gallery and social features
- Advanced AI features (optimization suggestions, code comparison)
- Admin moderation tools

This phased approach allows for independent testing and deployment of each priority tier.
