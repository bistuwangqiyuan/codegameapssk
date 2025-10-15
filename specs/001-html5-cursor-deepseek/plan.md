# Implementation Plan: GameCode Lab - 游戏化 HTML5 编程教育平台

**Branch**: `001-html5-cursor-deepseek` | **Date**: October 15, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-html5-cursor-deepseek/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

GameCode Lab is an AI-powered, gamified HTML5/CSS/JavaScript learning platform that enables zero-friction onboarding through automatic guest trial accounts. Users progress through a structured 5-level curriculum with real-time AI tutoring from "CodeMentor DS", earning XP and achievements while writing code in a secure browser sandbox. The platform leverages Astro for SSR performance, Supabase for authentication and data persistence, and DeepSeek AI (with fallbacks) for intelligent code analysis and personalized learning paths.

**Core Technical Approach**:

- **Frontend**: Astro with React islands for interactive components (code editor, gamification UI)
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions) for serverless architecture
- **AI Integration**: DeepSeek API with automatic failover to 10+ backup providers
- **Code Execution**: Client-side iframe sandbox with CSP and execution limits
- **Deployment**: Netlify with global CDN for optimal performance

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), JavaScript ES2022+ for client-side sandbox  
**Primary Dependencies**:

- **Frontend**: Astro 4.x, React 18.x, Tailwind CSS 3.x, shadcn/ui components, Monaco Editor or CodeMirror 6
- **Backend**: Supabase Client SDK, Supabase Edge Functions (Deno runtime)
- **State Management**: Zustand or Recoil for React state
- **AI SDKs**: DeepSeek API client, fallback clients (GLM, Moonshot, Tongyi, etc.)
- **Animation**: Framer Motion for gamification effects
- **Testing**: Vitest for unit tests, Playwright for E2E testing

**Storage**: Supabase PostgreSQL 15+ with Row Level Security (RLS) for multi-tenant data isolation  
**Testing**: Vitest (unit/integration), Playwright (E2E), Supabase local testing environment  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), responsive design with desktop-first approach  
**Project Type**: Web application (Astro full-stack with API routes)  
**Performance Goals**:

- First Contentful Paint: <1.5s
- Time to Interactive: <2.5s
- Code execution feedback: <2s (95th percentile)
- AI response time: <5s (90th percentile)
- Support 500 concurrent users

**Constraints**:

- Guest trial duration: 30 days tracked via browser local storage + server-side validation
- Sandbox execution limits: 5-second max runtime, memory caps enforced by browser
- AI rate limiting: 100 requests per user per day
- Code editor debounce: 300-500ms for live preview updates
- Offline capability: Not required (online-only for AI features)

**Scale/Scope**:

- Expected MVP launch: 100-500 active users
- Target growth: 5,000 users within 6 months
- Content: 5 levels × ~12 lessons/level = ~60 lessons initially
- Database rows: ~10K users, ~50K projects, ~100K AI interactions in first 6 months
- Storage: ~50MB per active user (code projects, cached AI responses)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Note**: No constitution.md file found in `.specify/memory/`. This is a new project without established architectural constraints. Creating a basic constitution for this educational platform:

### Proposed Constitution Principles

**I. Security-First Code Execution**

- All user-provided code MUST execute in isolated sandboxes (iframes with CSP)
- NO direct execution of user code in main application context
- Sandboxes MUST enforce time limits (5s) and memory constraints
- ALL user inputs MUST be sanitized before storage or display

**II. AI Provider Redundancy (NON-NEGOTIABLE)**

- Primary AI provider (DeepSeek) MUST have at minimum 2 fallback providers configured
- System MUST gracefully degrade if all AI providers are unavailable
- Cached AI responses MUST be used when appropriate to reduce API costs
- Rate limiting MUST be enforced at both application and per-user levels

**III. Guest Trial Integrity**

- Guest accounts MUST have server-side tracking in addition to client-side cookies
- Progress migration from guest → registered MUST be atomic and data-preserving
- Trial expiration MUST NOT interrupt active learning sessions (grace period)
- Anonymous account recovery MUST be possible via unique tokens

**IV. Data Privacy & Multi-Tenancy**

- Row Level Security (RLS) MUST be enabled for all user-facing tables
- Teachers MUST only access data for their enrolled students
- Admins MUST have audit logs for all privileged operations
- User data MUST NOT be shared with AI providers without explicit consent

**V. Performance & Scalability**

- Static assets MUST be served via CDN (Netlify)
- Database queries MUST use appropriate indexes (monitored via Supabase dashboard)
- Caching MUST be implemented for frequently accessed content (lessons, challenges)
- Edge functions MUST be used for AI proxy to minimize cold start latency

**VI. Testing & Quality**

- All API endpoints MUST have integration tests
- Critical user flows (guest trial, code execution, AI feedback) MUST have E2E tests
- Sandbox security MUST be tested with malicious code samples
- AI fallback logic MUST be tested under simulated provider failures

**✅ CONSTITUTION CHECK PASSED**: All requirements align with proposed principles. No violations identified.

## Project Structure

### Documentation (this feature)

```
specs/001-html5-cursor-deepseek/
├── spec.md              # Complete feature specification (DONE)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command - TO BE CREATED)
├── data-model.md        # Phase 1 output (/speckit.plan command - TO BE CREATED)
├── quickstart.md        # Phase 1 output (/speckit.plan command - TO BE CREATED)
├── contracts/           # Phase 1 output (/speckit.plan command - TO BE CREATED)
│   ├── api-endpoints.yaml
│   ├── ai-service-interface.yaml
│   └── supabase-schema.sql
├── checklists/          # Quality validation
│   └── requirements.md  # Specification quality checklist (DONE)
├── README.md            # Feature overview and quick start (DONE)
├── ENVIRONMENT_SETUP.md # Configuration guide (DONE)
├── VALIDATION_REPORT.md # Approval documentation (DONE)
└── COMPLETION_SUMMARY.md # Next steps summary (DONE)
```

### Source Code (repository root)

```
# Web Application Structure (Astro full-stack)

├── astro.config.mjs          # Astro configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variables template
│
├── src/                      # Astro source code
│   ├── pages/                # Astro pages (routes)
│   │   ├── index.astro       # Homepage with guest trial CTA
│   │   ├── learn/            # Learning interface
│   │   │   ├── [level]/      # Dynamic level pages
│   │   │   │   └── [lesson].astro
│   │   │   └── index.astro   # Learning path overview
│   │   ├── community/        # Project gallery
│   │   │   ├── index.astro
│   │   │   └── [projectId].astro
│   │   ├── leaderboard.astro
│   │   ├── profile/
│   │   │   └── [userId].astro
│   │   ├── teacher/          # Teacher dashboard
│   │   │   ├── courses.astro
│   │   │   └── students.astro
│   │   ├── admin/            # Admin panel
│   │   │   └── index.astro
│   │   └── api/              # API routes
│   │       ├── auth/         # Authentication endpoints
│   │       ├── ai/           # AI proxy endpoints
│   │       ├── sandbox/      # Code execution validation
│   │       ├── progress/     # User progress tracking
│   │       └── community/    # Social features
│   │
│   ├── components/           # Reusable components
│   │   ├── react/            # React interactive components
│   │   │   ├── CodeEditor/   # Monaco/CodeMirror wrapper
│   │   │   ├── CodeSandbox/  # Three-panel editor + preview
│   │   │   ├── AIAssistant/  # Chat interface for CodeMentor DS
│   │   │   ├── Gamification/ # XP bars, level indicators, achievements
│   │   │   ├── Leaderboard/
│   │   │   └── ProjectGallery/
│   │   └── astro/            # Astro static components
│   │       ├── Header.astro
│   │       ├── Footer.astro
│   │       ├── LessonCard.astro
│   │       └── CourseProgress.astro
│   │
│   ├── layouts/              # Page layouts
│   │   ├── BaseLayout.astro  # Base HTML structure
│   │   ├── LearningLayout.astro
│   │   └── DashboardLayout.astro
│   │
│   ├── lib/                  # Utility libraries
│   │   ├── supabase/         # Supabase client & queries
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── queries/      # Database query functions
│   │   │   └── migrations/   # SQL migrations
│   │   ├── ai/               # AI provider abstraction
│   │   │   ├── providers/    # DeepSeek, GLM, Moonshot, etc.
│   │   │   ├── fallback.ts   # Provider selection logic
│   │   │   └── cache.ts      # AI response caching
│   │   ├── sandbox/          # Code execution safety
│   │   │   ├── validator.ts  # Pre-execution checks
│   │   │   └── csp.ts        # Content Security Policy rules
│   │   └── gamification/     # XP/level/achievement logic
│   │       ├── xp-calculator.ts
│   │       ├── achievements.ts
│   │       └── leaderboard.ts
│   │
│   ├── stores/               # State management (Zustand/Recoil)
│   │   ├── authStore.ts      # User authentication state
│   │   ├── editorStore.ts    # Code editor state
│   │   ├── progressStore.ts  # Learning progress state
│   │   └── uiStore.ts        # UI preferences (theme, language)
│   │
│   ├── styles/               # Global styles
│   │   ├── global.css        # Tailwind base + custom styles
│   │   └── themes/           # Editor themes
│   │
│   └── types/                # TypeScript types
│       ├── database.ts       # Supabase generated types
│       ├── ai.ts             # AI provider interfaces
│       └── entities.ts       # Domain models
│
├── supabase/                 # Supabase configuration
│   ├── config.toml           # Local development config
│   ├── migrations/           # Database migrations
│   │   └── 00001_initial_schema.sql
│   └── functions/            # Edge Functions (Deno)
│       ├── ai-proxy/         # AI provider proxy with rate limiting
│       ├── code-validator/   # Server-side code validation
│       └── trial-manager/    # Guest trial expiration handling
│
├── public/                   # Static assets
│   ├── images/
│   ├── icons/
│   └── sounds/               # Achievement sound effects
│
└── tests/                    # Test suites
    ├── unit/                 # Vitest unit tests
    │   ├── lib/
    │   └── stores/
    ├── integration/          # API integration tests
│   └── api/
    └── e2e/                  # Playwright E2E tests
        ├── guest-trial.spec.ts
        ├── learning-flow.spec.ts
        ├── code-sandbox.spec.ts
        └── gamification.spec.ts
```

**Structure Decision**: Web application structure chosen based on Astro full-stack architecture with React islands for interactive components. The `src/pages/` directory follows Astro's file-based routing convention. API routes are co-located in `src/pages/api/` for simplicity. Supabase Edge Functions are kept in a separate `supabase/functions/` directory following Supabase CLI conventions. This structure supports the specified tech stack (Astro + React + Supabase) while maintaining clear separation of concerns.

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**✅ NO VIOLATIONS IDENTIFIED** - All requirements align with proposed constitution principles.

---

## Phase 0: Research & Technology Decisions

_Status: TO BE COMPLETED_

Research tasks to resolve NEEDS CLARIFICATION items and finalize technology choices:

1. **Code Editor Selection**: Monaco Editor vs CodeMirror 6

   - Evaluation criteria: Bundle size, TypeScript support, mobile responsiveness, customization
   - Current lean: Monaco Editor (used by VS Code, excellent TypeScript support)

2. **State Management**: Zustand vs Recoil

   - Evaluation criteria: Bundle size, React 18 compatibility, TypeScript support, learning curve
   - Current lean: Zustand (simpler API, smaller bundle)

3. **AI Provider Integration Patterns**

   - Research: Best practices for multi-provider failover in production
   - Research: Caching strategies for LLM responses
   - Research: Rate limiting patterns for AI APIs

4. **Code Sandbox Security**

   - Research: CSP policies for secure iframe sandboxing
   - Research: Web Workers vs iframes for code execution
   - Research: Memory and execution time limiting techniques

5. **Guest Trial Implementation**

   - Research: Local storage vs IndexedDB for client-side trial tracking
   - Research: Server-side trial validation strategies
   - Research: Progress migration patterns (guest → registered)

6. **Supabase Edge Functions**

   - Research: Cold start optimization techniques
   - Research: Deno runtime best practices for AI proxying
   - Research: Error handling and retry logic

7. **Internationalization (i18n)**
   - Decision: astro-i18next vs manual implementation
   - Decision: Translation management workflow

**Output**: [research.md](./research.md) - TO BE CREATED

---

## Phase 1: Design Artifacts

_Status: TO BE COMPLETED_

### Data Model

**Output**: [data-model.md](./data-model.md) - TO BE CREATED

Key entities to be detailed:

- User (with guest trial tracking)
- LearningPath, Level, Lesson, Challenge
- Project (user-created code)
- Achievement, XP progression
- AIInteraction (conversation history)
- BossChallenge, Leaderboard
- Course (teacher-created), Comment

### API Contracts

**Output**: [contracts/](./contracts/) directory - TO BE CREATED

Contracts to be generated:

1. **REST API Endpoints** (`api-endpoints.yaml`):

   - Authentication: `/api/auth/guest`, `/api/auth/register`, `/api/auth/login`, `/api/auth/oauth`
   - Learning: `/api/lessons/{id}`, `/api/challenges/{id}/submit`, `/api/progress`
   - AI: `/api/ai/feedback`, `/api/ai/hint`, `/api/ai/chat`
   - Gamification: `/api/xp`, `/api/achievements`, `/api/leaderboard`
   - Community: `/api/projects`, `/api/projects/{id}/like`, `/api/projects/{id}/comment`
   - Teacher: `/api/courses`, `/api/students/{id}/progress`
   - Admin: `/api/admin/moderation`, `/api/admin/ai-config`

2. **AI Service Interface** (`ai-service-interface.yaml`):

   - Provider abstraction layer
   - Request/response schemas
   - Fallback mechanisms

3. **Supabase Schema** (`supabase-schema.sql`):
   - Database tables with RLS policies
   - Indexes for query optimization
   - Triggers for automated tasks (XP calculation, trial expiration)

### Development Quickstart

**Output**: [quickstart.md](./quickstart.md) - TO BE CREATED

To include:

- Prerequisites (Node.js, Supabase CLI, environment variables)
- Local development setup steps
- Running Supabase locally
- Seeding initial data (lessons, challenges)
- Testing AI provider integration
- Running tests

### Agent Context Update

**Status**: TO BE COMPLETED after Phase 1 artifacts are generated

Run: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`

---

## Implementation Phases (from spec.md)

### Phase 1: Core Learning MVP (6-8 weeks) - P1 Stories

**Deliverables**:

- Guest trial system with automatic account creation
- Levels 1-2 (HTML5 + CSS) with 10+ lessons each
- Three-panel code sandbox with live preview
- Basic AI feedback integration (DeepSeek)
- XP and level progression (Lv1-5)
- Responsive UI with Tailwind CSS + shadcn/ui

**Success Gate**: Users can complete HTML/CSS lessons with AI feedback and earn XP

### Phase 2: Enhanced Engagement (4 weeks) - P2 Stories

**Deliverables**:

- Levels 3-5 (JavaScript, DOM, Projects)
- Full gamification (achievements, leaderboard, rewards shop)
- Teacher role with custom course creation
- Student analytics dashboard
- Enhanced AI capabilities (personalized learning paths)

**Success Gate**: Full learning path functional with gamification driving engagement

### Phase 3: Advanced Features (4 weeks) - P3 Stories

**Deliverables**:

- AI Boss challenges with randomized problems
- Community project gallery
- Social features (likes, comments, forks)
- Admin moderation tools
- Advanced AI features (code optimization suggestions)

**Success Gate**: Community active with featured projects and advanced learners engaged

---

## Next Steps

1. ✅ Complete this implementation plan
2. ⏳ Generate `research.md` with technology decision rationale
3. ⏳ Generate `data-model.md` with detailed entity schemas
4. ⏳ Generate API contracts in `contracts/` directory
5. ⏳ Generate `quickstart.md` for development setup
6. ⏳ Update agent context with technology stack
7. ⏳ Run `/speckit.tasks` to generate implementation task breakdown

**Ready for**: Phase 0 research to begin
