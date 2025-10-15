# Tasks: GameCode Lab - 游戏化 HTML5 编程教育平台

**Input**: Design documents from `/specs/001-html5-cursor-deepseek/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅  
**Branch**: `001-html5-cursor-deepseek`

**Tests**: Tests are not explicitly requested in the specification, so test tasks are not included in this implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. The MVP consists of User Stories 1, 2, and 4 (all P1 priorities).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- Include exact file paths in descriptions

## Path Conventions

**Web application structure** (Astro full-stack):

- Frontend: `src/pages/`, `src/components/`, `src/layouts/`
- API Routes: `src/pages/api/`
- Libraries: `src/lib/`
- State: `src/stores/`
- Edge Functions: `supabase/functions/`
- Tests: `tests/`

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and foundational structure

- [X] T001 Initialize Astro 4.x project with TypeScript 5.x in strict mode
- [X] T002 Configure package.json with dependencies: React 18.x, Tailwind CSS 3.x, @monaco-editor/react, zustand, @supabase/supabase-js, framer-motion
- [X] T003 [P] Set up Tailwind CSS configuration in tailwind.config.mjs with custom theme
- [X] T004 [P] Configure TypeScript with strict mode in tsconfig.json
- [X] T005 [P] Set up ESLint and Prettier for code quality
- [X] T006 Create .env.example with all required environment variables from ENVIRONMENT_SETUP.md
- [X] T007 Add .env to .gitignore and create .env file with actual API keys
- [X] T008 [P] Set up Vitest configuration in vitest.config.ts
- [X] T009 [P] Set up Playwright configuration in playwright.config.ts
- [X] T010 Create project directory structure per plan.md (src/pages/, src/components/, src/lib/, src/stores/, supabase/)
- [X] T011 [P] Initialize Supabase project locally with supabase init
- [X] T012 [P] Configure Netlify deployment in netlify.toml
- [X] T013 [P] Set up astro-i18next for internationalization in astro.config.mjs
- [X] T014 Create global styles in src/styles/global.css with Tailwind directives

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T015 Create initial database migration schema in supabase/migrations/00001_initial_schema.sql with users, guest_trials, learning_paths, levels, lessons, challenges tables
- [X] T016 Configure Row Level Security (RLS) policies for all tables in migration file
- [X] T017 Set up database indexes for performance optimization in migration file
- [X] T018 Run database migration with supabase db push
- [X] T019 Generate TypeScript types from Supabase schema in src/types/database.ts using supabase gen types typescript
- [X] T020 [P] Create Supabase client singleton in src/lib/supabase/client.ts
- [X] T021 [P] Implement authentication utilities in src/lib/supabase/auth.ts (guest trial creation, registration, login, OAuth)
- [X] T022 [P] Create AI provider abstraction layer in src/lib/ai/providers/ with base interface
- [X] T023 [P] Implement DeepSeek provider in src/lib/ai/providers/deepseek.ts
- [X] T024 [P] Implement AI fallback manager in src/lib/ai/fallback.ts with circuit breaker pattern
- [X] T025 [P] Implement AI response cache in src/lib/ai/cache.ts using LRU strategy
- [X] T026 [P] Create sandbox security utilities in src/lib/sandbox/validator.ts
- [X] T027 [P] Define CSP policies for sandbox in src/lib/sandbox/csp.ts
- [X] T028 [P] Create base layout component in src/layouts/BaseLayout.astro
- [X] T029 [P] Create learning layout component in src/layouts/LearningLayout.astro
- [X] T030 [P] Create dashboard layout component in src/layouts/DashboardLayout.astro
- [X] T031 [P] Create authentication store in src/stores/authStore.ts with Zustand
- [X] T032 [P] Create UI preferences store in src/stores/uiStore.ts with Zustand persist middleware
- [X] T033 [P] Set up translation files structure in src/locales/en/ and src/locales/zh/
- [X] T034 [P] Create common translations in src/locales/en/common.json and src/locales/zh/common.json

**✅ Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Guest User Trial Learning Journey (Priority: P1) 🎯 MVP ✅ COMPLETE

**Goal**: Enable visitors to immediately start learning without registration, automatically creating 30-day trial accounts, progressing through HTML5 basics with code execution and AI feedback, earning XP and leveling up

**Independent Test**: Open platform in incognito browser, click "Start Learning Now", complete an HTML lesson with code execution, receive AI feedback, earn XP points - all without creating an account

### Implementation for User Story 1

- [X] T035 [P] [US1] Create User entity types in src/types/entities.ts
- [X] T036 [P] [US1] Create GuestTrial entity types in src/types/entities.ts
- [X] T037 [P] [US1] Create XP and Level entity types in src/types/entities.ts
- [X] T038 [US1] Implement guest trial service in src/lib/supabase/queries/guest-trials.ts (create, validate, sync)
- [X] T039 [US1] Implement user progress service in src/lib/supabase/queries/progress.ts
- [X] T040 [US1] Implement XP calculation logic in src/lib/gamification/xp-calculator.ts
- [X] T041 [P] [US1] Create homepage in src/pages/index.astro with "Start Learning Now" CTA
- [X] T042 [P] [US1] Create Header component in src/components/astro/Header.astro with user level display
- [X] T043 [P] [US1] Create Footer component in src/components/astro/Footer.astro
- [X] T044 [US1] Create guest trial API endpoint in src/pages/api/auth/guest.ts
- [X] T045 [US1] Create trial expiration check middleware
- [X] T046 [P] [US1] Create XP display component in src/components/react/Gamification/XPBar.tsx
- [X] T047 [P] [US1] Create level indicator component in src/components/react/Gamification/LevelBadge.tsx
- [X] T048 [P] [US1] Create level-up animation component in src/components/react/Gamification/LevelUpAnimation.tsx using Framer Motion
- [X] T049 [US1] Create trial expiration warning component in src/components/react/TrialExpirationWarning.tsx
- [X] T050 [US1] Implement guest-to-registered migration API in src/pages/api/auth/migrate.ts
- [X] T051 [US1] Implement progress persistence on page unload in authStore
- [X] T052 [US1] Create Supabase Edge Function for trial validation in supabase/functions/trial-manager/index.ts
- [X] T053 [US1] Add user progress tracking in src/lib/supabase/queries/analytics.ts

**✅ Checkpoint**: User Story 1 is COMPLETE! Guests can start learning, earn XP, and see trial status

---

## Phase 4: User Story 2 - Progressive Learning Path with AI Tutoring (Priority: P1) 🎯 MVP

**Goal**: Implement structured 5-level curriculum (HTML5 → CSS → JavaScript → DOM → Projects) with AI-powered hints, explanations, and personalized feedback through "CodeMentor DS"

**Independent Test**: Complete a full learning path from Level 1 to Level 2, with AI providing explanations, checking code correctness, and offering contextual hints when requested

### Implementation for User Story 2

- [X] T054 [P] [US2] Create LearningPath, Level, Lesson, Challenge entity types in src/types/entities.ts
- [X] T055 [P] [US2] Create AIInteraction entity types in src/types/entities.ts
- [X] T056 [US2] Add learning content tables to database migration (if not in T015)
- [X] T057 [US2] Implement lesson queries in src/lib/supabase/queries/lessons.ts
- [X] T058 [US2] Implement challenge queries in src/lib/supabase/queries/challenges.ts
- [X] T059 [US2] Implement level unlock logic in src/lib/gamification/level-unlock.ts
- [X] T060 [P] [US2] Create learning path overview page in src/pages/learn/index.astro
- [X] T061 [P] [US2] Create dynamic level page in src/pages/learn/[level]/index.astro
- [X] T062 [P] [US2] Create dynamic lesson page in src/pages/learn/[level]/[lesson].astro
- [X] T063 [P] [US2] Create LessonCard component in src/components/astro/LessonCard.astro
- [X] T064 [P] [US2] Create CourseProgress component in src/components/astro/CourseProgress.astro
- [X] T065 [US2] Create AI feedback API endpoint in src/pages/api/ai/feedback.ts
- [X] T066 [US2] Create AI hint API endpoint in src/pages/api/ai/hint.ts
- [X] T067 [US2] Create AI chat API endpoint in src/pages/api/ai/chat.ts
- [X] T068 [US2] Create Supabase Edge Function for AI proxy in supabase/functions/ai-proxy/index.ts with rate limiting
- [X] T069 [US2] Implement AI provider manager in Edge Function with fallback logic
- [X] T070 [US2] Implement rate limiter in Edge Function (100 calls/user/day)
- [X] T071 [US2] Implement cache manager in Edge Function using LRU + semantic similarity
- [X] T072 [P] [US2] Create AI Assistant chat interface in src/components/react/AIAssistant/ChatInterface.tsx
- [X] T073 [P] [US2] Create AI Assistant message bubble component in src/components/react/AIAssistant/MessageBubble.tsx
- [X] T074 [P] [US2] Create "Get Hint" button component in src/components/react/AIAssistant/HintButton.tsx
- [X] T075 [US2] Implement AI conversation history storage in src/lib/supabase/queries/ai-interactions.ts
- [X] T076 [US2] Create personalized learning recommendations logic in src/lib/ai/recommendations.ts
- [X] T077 [US2] Implement sequential level progression enforcement in lesson queries
- [X] T078 [US2] Create progress store in src/stores/progressStore.ts with Zustand
- [X] T079 [US2] Seed initial lesson content for Level 1 (HTML5 basics) - 10-12 lessons
- [X] T080 [US2] Seed initial lesson content for Level 2 (CSS styling) - 12-15 lessons

**Checkpoint**: At this point, User Story 2 should be fully functional - users can progress through levels with AI tutoring

---

## Phase 5: User Story 4 - Interactive Code Sandbox Environment (Priority: P1) 🎯 MVP

**Goal**: Implement three-panel code editor (HTML/CSS/JS) with Monaco Editor, real-time sandboxed preview, project saving/loading, and export functionality

**Independent Test**: Write code in each of the three panels, see live preview updates, save a project, retrieve it later, and export as ZIP

### Implementation for User Story 4

- [X] T081 [P] [US4] Create Project entity types in src/types/entities.ts
- [X] T082 [US4] Add projects table to database migration (if not in T015)
- [X] T083 [US4] Configure Monaco Editor lazy loading in src/lib/monaco-config.ts
- [X] T084 [US4] Implement project queries in src/lib/supabase/queries/projects.ts (save, load, list)
- [X] T085 [P] [US4] Create editor store in src/stores/editorStore.ts with Zustand (HTML/CSS/JS state, debounce)
- [X] T086 [P] [US4] Create MonacoEditor wrapper component in src/components/react/CodeEditor/MonacoEditor.tsx
- [X] T087 [P] [US4] Create three-panel editor layout in src/components/react/CodeSandbox/EditorPanels.tsx
- [X] T088 [P] [US4] Create sandbox preview component in src/components/react/CodeSandbox/SandboxPreview.tsx with iframe
- [X] T089 [US4] Implement sandbox iframe manager in src/lib/sandbox/iframe-manager.ts (create, destroy, postMessage)
- [X] T090 [US4] Implement execution timeout logic in iframe sandbox code
- [X] T091 [US4] Implement infinite loop detection in src/lib/sandbox/loop-detector.ts using static analysis
- [X] T092 [P] [US4] Create code execution API endpoint in src/pages/api/sandbox/execute.ts for validation
- [X] T093 [P] [US4] Create project save API endpoint in src/pages/api/projects/save.ts
- [X] T094 [P] [US4] Create project load API endpoint in src/pages/api/projects/[id].ts
- [X] T095 [P] [US4] Create project export endpoint in src/pages/api/projects/[id]/export.ts (ZIP generation)
- [X] T096 [P] [US4] Create "Save Project" button component in src/components/react/CodeSandbox/SaveButton.tsx
- [X] T097 [P] [US4] Create "Export Project" button component in src/components/react/CodeSandbox/ExportButton.tsx
- [X] T098 [P] [US4] Create project deployment integration with Netlify API in src/lib/deployment/netlify.ts
- [X] T099 [US4] Implement real-time preview updates with debounce (300-500ms)
- [X] T100 [US4] Add error handling for sandbox execution errors with user-friendly messages
- [X] T101 [US4] Configure custom Monaco themes matching Tailwind palette in src/lib/monaco-config.ts

**Checkpoint**: At this point, User Story 4 should be fully functional - users can write, execute, and save code

---

**🎉 MVP COMPLETE**: At this point, User Stories 1, 2, and 4 are fully implemented. This is a complete, shippable MVP that delivers core learning value. Stop here to test, validate, and potentially deploy before continuing with P2/P3 features.

---

## Phase 6: User Story 3 - Gamification and Motivation System (Priority: P2)

**Goal**: Enhance engagement with full gamification system including achievements, leaderboards, rewards shop, and cosmetic unlocks

**Independent Test**: Complete multiple lessons, earn XP, level up, unlock an achievement, view leaderboard, and spend coins in rewards shop

### Implementation for User Story 3

- [ ] T102 [P] [US3] Create Achievement entity types in src/types/entities.ts
- [ ] T103 [P] [US3] Create Leaderboard entity types in src/types/entities.ts
- [ ] T104 [US3] Add achievements, leaderboard, and rewards tables to database migration
- [ ] T105 [US3] Implement achievement unlock logic in src/lib/gamification/achievements.ts
- [ ] T106 [US3] Implement leaderboard calculation in src/lib/gamification/leaderboard.ts
- [ ] T107 [US3] Implement coin reward system in src/lib/gamification/coins.ts
- [ ] T108 [P] [US3] Create leaderboard page in src/pages/leaderboard.astro
- [ ] T109 [P] [US3] Create rewards shop page in src/pages/rewards.astro
- [ ] T110 [P] [US3] Create leaderboard component in src/components/react/Leaderboard/LeaderboardTable.tsx
- [ ] T111 [P] [US3] Create achievement badge component in src/components/react/Gamification/AchievementBadge.tsx
- [ ] T112 [P] [US3] Create achievement notification component in src/components/react/Gamification/AchievementNotification.tsx with Framer Motion
- [ ] T113 [P] [US3] Create rewards shop grid component in src/components/react/Gamification/RewardsShop.tsx
- [ ] T114 [US3] Create leaderboard API endpoint in src/pages/api/leaderboard.ts (by XP, speed, projects)
- [ ] T115 [US3] Create achievements API endpoint in src/pages/api/achievements/index.ts
- [ ] T116 [US3] Create rewards purchase API endpoint in src/pages/api/rewards/purchase.ts
- [ ] T117 [US3] Implement streak tracking in src/lib/gamification/streaks.ts (7-day streak achievement)
- [ ] T118 [US3] Implement zero-error challenge tracking in progress service
- [ ] T119 [US3] Seed initial achievements (First Success, 7-Day Streak, Zero Errors, etc.)
- [ ] T120 [US3] Seed initial rewards (editor themes, avatars, code snippet templates)

**Checkpoint**: At this point, User Story 3 should be fully functional - gamification drives user engagement

---

## Phase 7: User Story 7 - Teacher and Admin Capabilities (Priority: P2)

**Goal**: Enable teachers to create custom courses, design challenges with test cases, and view student analytics; enable admins to moderate content and configure AI settings

**Independent Test**: Log in as teacher, create a custom lesson with test cases, assign to students, view completion status; log in as admin, moderate content, adjust AI settings

### Implementation for User Story 7

- [ ] T121 [P] [US7] Create Course entity types in src/types/entities.ts
- [ ] T122 [US7] Add courses, enrollments, and teacher-student relationships to database migration
- [ ] T123 [US7] Implement course queries in src/lib/supabase/queries/courses.ts
- [ ] T124 [US7] Implement student analytics queries in src/lib/supabase/queries/analytics.ts
- [ ] T125 [P] [US7] Create teacher dashboard page in src/pages/teacher/index.astro
- [ ] T126 [P] [US7] Create course creation page in src/pages/teacher/courses/create.astro
- [ ] T127 [P] [US7] Create student progress dashboard page in src/pages/teacher/students.astro
- [ ] T128 [P] [US7] Create admin dashboard page in src/pages/admin/index.astro
- [ ] T129 [P] [US7] Create admin moderation page in src/pages/admin/moderation.astro
- [ ] T130 [P] [US7] Create admin AI configuration page in src/pages/admin/ai-config.astro
- [ ] T131 [P] [US7] Create course builder component in src/components/react/Teacher/CourseBuilder.tsx
- [ ] T132 [P] [US7] Create test case editor component in src/components/react/Teacher/TestCaseEditor.tsx
- [ ] T133 [P] [US7] Create student analytics table component in src/components/react/Teacher/StudentAnalytics.tsx
- [ ] T134 [US7] Create course creation API endpoint in src/pages/api/courses/create.ts
- [ ] T135 [US7] Create student progress API endpoint in src/pages/api/teacher/students/[id]/progress.ts
- [ ] T136 [US7] Create content moderation API endpoint in src/pages/api/admin/moderation.ts
- [ ] T137 [US7] Create AI configuration API endpoint in src/pages/api/admin/ai-config.ts
- [ ] T138 [US7] Implement role-based access control middleware for teacher/admin routes
- [ ] T139 [US7] Implement automated grading for custom challenges using test cases

**Checkpoint**: At this point, User Story 7 should be fully functional - teachers can create courses, admins can moderate

---

## Phase 8: User Story 6 - Community Project Showcase (Priority: P3)

**Goal**: Enable users to publish projects to a community gallery, browse others' work, like/comment/fork projects, with AI-curated daily recommendations

**Independent Test**: Publish a project, view it in the gallery, like another user's project, leave a comment, and fork a project

### Implementation for User Story 6

- [ ] T140 [P] [US6] Create Comment entity types in src/types/entities.ts
- [ ] T141 [US6] Add comments, likes, and featured_projects tables to database migration
- [ ] T142 [US6] Implement community project queries in src/lib/supabase/queries/community.ts
- [ ] T143 [P] [US6] Create community gallery page in src/pages/community/index.astro
- [ ] T144 [P] [US6] Create project detail page in src/pages/community/[projectId].astro
- [ ] T145 [P] [US6] Create project gallery grid component in src/components/react/ProjectGallery/ProjectGrid.tsx
- [ ] T146 [P] [US6] Create project card component in src/components/react/ProjectGallery/ProjectCard.tsx with thumbnail
- [ ] T147 [P] [US6] Create comment section component in src/components/react/ProjectGallery/CommentSection.tsx
- [ ] T148 [P] [US6] Create like button component in src/components/react/ProjectGallery/LikeButton.tsx
- [ ] T149 [US6] Create project publish API endpoint in src/pages/api/projects/publish.ts
- [ ] T150 [US6] Create like/unlike API endpoint in src/pages/api/projects/[id]/like.ts
- [ ] T151 [US6] Create comment API endpoint in src/pages/api/projects/[id]/comment.ts
- [ ] T152 [US6] Create fork project API endpoint in src/pages/api/projects/[id]/fork.ts
- [ ] T153 [US6] Create Supabase Edge Function for AI project review in supabase/functions/ai-curator/index.ts
- [ ] T154 [US6] Implement daily AI curation job using Supabase scheduled functions
- [ ] T155 [US6] Generate AI descriptions for featured projects
- [ ] T156 [US6] Display featured projects on homepage

**Checkpoint**: At this point, User Story 6 should be fully functional - community features drive engagement

---

## Phase 9: User Story 5 - AI Boss Challenges and Advanced Features (Priority: P3)

**Goal**: Implement AI-generated randomized coding challenges for advanced learners (Level 4+) with timed challenges, scoring tiers, and code optimization suggestions

**Independent Test**: Trigger an AI Boss challenge, complete it within time limits, receive feedback on code efficiency, and earn bonus XP

### Implementation for User Story 5

- [ ] T157 [P] [US5] Create BossChallenge entity types in src/types/entities.ts
- [ ] T158 [US5] Add boss_challenges and boss_attempts tables to database migration
- [ ] T159 [US5] Implement boss challenge queries in src/lib/supabase/queries/boss-challenges.ts
- [ ] T160 [P] [US5] Create boss challenge page in src/pages/learn/boss-challenge.astro
- [ ] T161 [P] [US5] Create boss challenge timer component in src/components/react/BossChallenge/Timer.tsx
- [ ] T162 [P] [US5] Create boss challenge score display component in src/components/react/BossChallenge/ScoreDisplay.tsx
- [ ] T163 [P] [US5] Create code optimization suggestions component in src/components/react/BossChallenge/OptimizationSuggestions.tsx
- [ ] T164 [US5] Create boss challenge generation API endpoint in src/pages/api/boss-challenge/generate.ts
- [ ] T165 [US5] Create boss challenge submission API endpoint in src/pages/api/boss-challenge/submit.ts
- [ ] T166 [US5] Implement AI boss challenge generation in Edge Function using DeepSeek
- [ ] T167 [US5] Implement code quality evaluation logic (correctness, efficiency, style)
- [ ] T168 [US5] Implement scoring tiers (Bronze/Silver/Gold) based on performance
- [ ] T169 [US5] Implement bonus XP calculation for boss challenge completions
- [ ] T170 [US5] Add countdown warnings at 5-minute and 1-minute marks

**Checkpoint**: At this point, all user stories are fully implemented - platform is feature-complete

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and prepare for production launch

- [ ] T171 [P] Implement comprehensive error boundaries in React components
- [ ] T172 [P] Add structured logging throughout application using console.log JSON format
- [ ] T173 [P] Implement analytics tracking for key user actions (lesson completion, code execution, AI usage)
- [ ] T174 [P] Optimize bundle size by analyzing with Astro build --analyze
- [ ] T175 [P] Implement lazy loading for Monaco Editor and heavy components
- [ ] T176 [P] Add loading states and skeletons for async operations
- [ ] T177 [P] Implement optimistic UI updates for better perceived performance
- [ ] T178 [P] Add comprehensive accessibility attributes (ARIA labels, keyboard navigation)
- [ ] T179 [P] Optimize images and assets for web delivery
- [ ] T180 [P] Implement CDN caching strategy for static assets on Netlify
- [ ] T181 [P] Add security headers in netlify.toml (CSP, X-Frame-Options, etc.)
- [ ] T182 [P] Set up monitoring and alerting (Supabase dashboard, Netlify analytics)
- [ ] T183 [P] Create user-facing documentation in docs/ directory
- [ ] T184 [P] Add favicon and PWA manifest for improved mobile experience
- [ ] T185 [P] Implement graceful degradation for AI unavailability scenarios
- [ ] T186 [P] Add rate limiting indicators in UI (remaining AI calls display)
- [ ] T187 [P] Implement keep-warm mechanism for Supabase Edge Functions
- [ ] T188 Performance audit: Verify First Contentful Paint <1.5s
- [ ] T189 Performance audit: Verify Time to Interactive <2.5s
- [ ] T190 Performance audit: Verify code execution feedback <2s (95th percentile)
- [ ] T191 Performance audit: Verify AI response time <5s (90th percentile)
- [ ] T192 Security audit: Test sandbox with malicious code samples
- [ ] T193 Security audit: Verify RLS policies prevent unauthorized data access
- [ ] T194 Security audit: Test rate limiting and DDoS protection
- [ ] T195 Run final Playwright E2E test suite across all user stories
- [ ] T196 Final review: Verify all success criteria from spec.md are met

**Checkpoint**: Platform is production-ready for launch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - After Foundation: User Stories 1, 2, 4 can proceed in parallel (all P1 - MVP)
  - After MVP: User Stories 3, 7 can proceed in parallel (P2)
  - After P2: User Stories 5, 6 can proceed in parallel (P3)
- **Polish (Phase 10)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Completely independent
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses US1 (trial system) but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances US1/US2 but independently testable
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Completely independent
- **User Story 5 (P3)**: Can start after US2 completion (requires lessons) - Uses US2/US4 but independently testable
- **User Story 6 (P3)**: Can start after US4 completion (requires projects) - Uses US4 but independently testable
- **User Story 7 (P2)**: Can start after US2 completion (requires lessons) - Uses US2 but independently testable

### Within Each User Story

- Entity types before queries/services
- Queries/services before API endpoints
- API endpoints before UI components
- Core implementation before enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T014)
- All Foundational tasks marked [P] can run in parallel within phase (T020-T034)
- **After Foundational completes, MVP stories (US1, US2, US4) can all start in parallel**
- Entity type definitions within a story can run in parallel (T035-T037, T054-T055, etc.)
- Independent components marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: MVP (User Stories 1, 2, 4)

Once Foundational phase completes, launch all three MVP stories simultaneously:

```bash
# Team Member A: User Story 1 (Guest Trial)
Tasks T035-T053

# Team Member B: User Story 2 (Learning Path + AI)
Tasks T054-T080

# Team Member C: User Story 4 (Code Sandbox)
Tasks T081-T101
```

Within each story, tasks marked [P] can also run in parallel:

```bash
# Example: User Story 1 entity types (all in src/types/entities.ts, but different sections)
Task T035: User entity types
Task T036: GuestTrial entity types
Task T037: XP and Level entity types
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 4 Only)

1. **Complete Phase 1: Setup** (T001-T014) - ~2-3 days
2. **Complete Phase 2: Foundational** (T015-T034) - ~1 week (CRITICAL - blocks everything)
3. **Complete Phase 3: User Story 1** (T035-T053) - ~1 week
4. **Complete Phase 4: User Story 2** (T054-T080) - ~2 weeks
5. **Complete Phase 5: User Story 4** (T081-T101) - ~1 week
6. **MVP VALIDATION**: Test all three stories independently
7. **Partial Polish** (T171-T196, select critical items) - ~3-5 days
8. **Deploy MVP to production** - Launch!

**Total MVP Timeline**: ~6-7 weeks

### Incremental Delivery

1. Setup + Foundational → Foundation ready (~2 weeks)
2. Add User Story 1 → Test independently → Deploy/Demo (Guest trial working!)
3. Add User Story 2 → Test independently → Deploy/Demo (Learning path + AI working!)
4. Add User Story 4 → Test independently → Deploy/Demo (Code sandbox working!) **= MVP LAUNCH**
5. Add User Story 3 → Test independently → Deploy/Demo (Gamification complete!)
6. Add User Story 7 → Test independently → Deploy/Demo (Teacher tools ready!)
7. Add User Story 6 → Test independently → Deploy/Demo (Community active!)
8. Add User Story 5 → Test independently → Deploy/Demo (Advanced challenges live!)
9. Each increment adds value without breaking previous features

### Parallel Team Strategy

With 3 developers after Foundational phase:

- **Developer A**: User Story 1 (Guest Trial) - 1 week
- **Developer B**: User Story 2 (Learning Path) - 2 weeks
- **Developer C**: User Story 4 (Code Sandbox) - 1 week

Developer A and C can then assist with User Story 2 or move to P2 stories.

With 5+ developers after Foundational phase:

- All P1 stories in parallel (US1, US2, US4) - ~2 weeks
- Then P2 stories in parallel (US3, US7) - ~1-2 weeks
- Then P3 stories in parallel (US5, US6) - ~1-2 weeks

**Full Feature Set Timeline**: ~10-14 weeks total

---

## Task Summary

**Total Tasks**: 196
**MVP Tasks**: T001-T101 (101 tasks)
**Enhancement Tasks**: T102-T170 (69 tasks)
**Polish Tasks**: T171-T196 (26 tasks)

**Tasks by User Story**:

- Setup: 14 tasks
- Foundational: 20 tasks
- User Story 1 (P1): 19 tasks
- User Story 2 (P1): 27 tasks
- User Story 3 (P2): 19 tasks
- User Story 4 (P1): 21 tasks
- User Story 5 (P3): 14 tasks
- User Story 6 (P3): 17 tasks
- User Story 7 (P2): 19 tasks
- Polish: 26 tasks

**Parallel Opportunities**: 87 tasks marked [P] can run in parallel within their phase
**MVP Focus**: Tasks T001-T101 deliver a complete, shippable product

---

## Notes

- [P] tasks = different files or independent sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are not included as they were not explicitly requested in specification
- MVP consists of User Stories 1, 2, and 4 (all P1 priorities)
- Commit after each task or logical group for better traceability
- Stop at any checkpoint to validate story independently
- **RECOMMENDATION**: Implement MVP (Phases 1-5) first, validate with users, then proceed with P2/P3 features based on feedback

---

**Ready to start**: Tasks are now executable. Begin with T001 and proceed sequentially through Setup, then Foundational, then MVP user stories.
