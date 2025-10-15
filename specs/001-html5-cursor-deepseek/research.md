# Research & Technology Decisions: GameCode Lab

**Feature**: 001-html5-cursor-deepseek  
**Date**: October 15, 2025  
**Status**: Phase 0 Complete

## Purpose

This document captures research findings and technology decisions made during the planning phase. All NEEDS CLARIFICATION items from the technical context have been resolved with rationale.

---

## 1. Code Editor Selection: Monaco Editor vs CodeMirror 6

### Decision: **Monaco Editor**

### Rationale

**Monaco Editor** (the editor that powers VS Code) is chosen for the following reasons:

1. **Superior TypeScript/JavaScript Support**:

   - Built-in IntelliSense and autocomplete for HTML/CSS/JS
   - Excellent error detection and syntax highlighting
   - Native support for JSX/TSX (future expansion)

2. **Bundle Size Acceptable**:

   - Monaco: ~3MB minified (~900KB gzipped)
   - CodeMirror 6: ~500KB minified (~150KB gzipped)
   - **Trade-off justified**: Better DX and learner experience outweighs bundle size
   - Mitigation: Lazy-load Monaco only on editor pages (not homepage)

3. **Customization & Theming**:

   - Rich theming API for gamification rewards (unlockable editor themes)
   - Easy to customize keybindings and behaviors
   - Built-in diff editor for code comparison features

4. **Mobile Considerations**:
   - Monaco has decent mobile support with touch gestures
   - Platform is desktop-first per spec assumptions, so this is acceptable

### Alternatives Considered

- **CodeMirror 6**: Lighter weight, excellent performance, but requires more configuration for the same feature set. Better suited for simpler editors.
- **Ace Editor**: Older, heavier, less actively maintained than Monaco or CodeMirror 6.

### Implementation Notes

- Use `@monaco-editor/react` wrapper for React integration
- Configure lazy loading: `monaco-editor-webpack-plugin` or dynamic imports
- Set up three editor instances (HTML, CSS, JS) with synchronized configuration
- Configure custom themes matching Tailwind color palette

---

## 2. State Management: Zustand vs Recoil

### Decision: **Zustand**

### Rationale

**Zustand** is chosen for its simplicity and performance:

1. **Bundle Size**:

   - Zustand: ~3KB minified
   - Recoil: ~22KB minified
   - **Significant difference**: Zustand is 7x smaller

2. **API Simplicity**:

   - Zustand: Simple hook-based API, easy to learn
   - Recoil: More complex with atoms, selectors, and atom families
   - **Better for team**: Lower learning curve for contributors

3. **React 18 Compatibility**:

   - Both support React 18 and concurrent features
   - Zustand has first-class TypeScript support with minimal boilerplate

4. **Middleware Ecosystem**:

   - Zustand: Built-in persist middleware (perfect for guest trial state)
   - Zustand: DevTools integration available
   - Zustand: Immer integration for immutable updates

5. **Performance**:
   - Zustand uses subscription-based updates (minimal re-renders)
   - No provider wrapper needed (less component tree overhead)

### Alternatives Considered

- **Recoil**: More feature-rich, but overkill for this project's needs. Better for very complex state graphs.
- **Redux Toolkit**: Too heavyweight, more boilerplate, better for large enterprise apps.
- **React Context**: Insufficient for performance-sensitive editor state updates.

### Implementation Notes

- Create stores for: `authStore`, `editorStore`, `progressStore`, `uiStore`
- Use `persist` middleware for guest trial state (localStorage)
- Integrate with React DevTools for debugging
- Consider `immer` middleware for complex state updates (gamification logic)

---

## 3. AI Provider Integration Patterns

### Research Findings

#### Multi-Provider Failover Strategy

**Pattern**: Waterfall with Circuit Breaker

```typescript
interface AIProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  priority: number;
  isHealthy(): Promise<boolean>;
  call(prompt: string): Promise<AIResponse>;
}

class AIProviderManager {
  private providers: AIProvider[];
  private circuitBreakers: Map<string, CircuitBreaker>;

  async getResponse(prompt: string): Promise<AIResponse> {
    // Try providers in priority order
    for (const provider of this.sortByPriority()) {
      if (this.circuitBreakers.get(provider.name).isOpen()) {
        continue; // Skip unhealthy providers
      }

      try {
        const response = await provider.call(prompt);
        this.circuitBreakers.get(provider.name).recordSuccess();
        return response;
      } catch (error) {
        this.circuitBreakers.get(provider.name).recordFailure();
        // Try next provider
      }
    }

    // All providers failed
    return this.getCachedResponse(prompt) || DEFAULT_ERROR_MESSAGE;
  }
}
```

**Best Practices**:

1. **Circuit Breaker Pattern**: After 5 consecutive failures, mark provider as unhealthy for 5 minutes
2. **Health Checks**: Ping provider `/health` endpoints every 30 seconds
3. **Priority Ordering**: DeepSeek (1) → GLM (2) → Moonshot (3) → others
4. **Timeout Configuration**: 5-second timeout per provider attempt
5. **Exponential Backoff**: Increase wait time between retries (1s, 2s, 4s)

#### Caching Strategies

**Pattern**: LRU Cache with Semantic Similarity

```typescript
interface CacheStrategy {
  // Exact match cache (fast)
  exactCache: LRUCache<string, AIResponse>;

  // Semantic similarity cache (slower but more flexible)
  semanticCache: VectorStore<AIResponse>;

  async get(prompt: string): Promise<AIResponse | null> {
    // Try exact match first
    const exact = this.exactCache.get(prompt);
    if (exact) return exact;

    // Try semantic similarity (embedding-based)
    const similar = await this.semanticCache.findSimilar(prompt, threshold=0.9);
    if (similar) return similar;

    return null;
  }
}
```

**Best Practices**:

1. **Cache Common Patterns**: Cache responses for common errors (syntax errors, undefined variables)
2. **TTL Strategy**: Short-lived (1 hour) for code-specific feedback, long-lived (1 week) for concept explanations
3. **Cache Invalidation**: Invalidate on AI model updates or user feedback (thumbs down)
4. **Embedding Model**: Use OpenAI `text-embedding-3-small` or Sentence Transformers for semantic matching
5. **Storage**: Redis for shared cache across Edge Functions, IndexedDB for client-side cache

#### Rate Limiting Patterns

**Pattern**: Token Bucket with User Quotas

```typescript
interface RateLimiter {
  // User-level rate limiting
  async checkUserLimit(userId: string): Promise<boolean> {
    const key = `ai_calls:${userId}:${currentDay()}`;
    const calls = await redis.incr(key);
    if (calls === 1) {
      await redis.expire(key, 86400); // 24 hours
    }
    return calls <= 100; // Max 100 calls per day
  }

  // Global rate limiting (protect against DDoS)
  async checkGlobalLimit(): Promise<boolean> {
    const key = `ai_calls:global:${currentMinute()}`;
    const calls = await redis.incr(key);
    if (calls === 1) {
      await redis.expire(key, 60); // 1 minute
    }
    return calls <= 1000; // Max 1000 calls per minute globally
  }
}
```

**Best Practices**:

1. **User Quotas**: 100 AI calls per user per day (spec requirement)
2. **Global Limits**: 1000 calls per minute to prevent platform abuse
3. **Soft vs Hard Limits**: Soft limit (warning) at 80 calls, hard limit at 100
4. **Priority Tiers**: Teachers get 200 calls/day, admins unlimited
5. **Quota Reset**: Daily reset at midnight UTC
6. **Client-Side Tracking**: Show remaining quota in UI

---

## 4. Code Sandbox Security

### Research Findings

#### CSP Policies for Secure Sandboxing

**Recommended CSP for Sandbox Iframe**:

```html
<iframe
  sandbox="allow-scripts"
  csp="
    default-src 'none';
    script-src 'unsafe-inline' 'unsafe-eval';
    style-src 'unsafe-inline';
    img-src data: blob:;
    font-src data:;
  "
  src="about:blank"
></iframe>
```

**Explanation**:

- `sandbox="allow-scripts"`: Only allow scripts, no forms, popups, or same-origin access
- `default-src 'none'`: Block all resources by default
- `script-src 'unsafe-inline' 'unsafe-eval'`: Allow user JavaScript (required for code execution)
- `style-src 'unsafe-inline'`: Allow user CSS
- `img-src data: blob:`: Allow images via data URIs (common in student projects)
- `font-src data:`: Allow fonts via data URIs

#### Web Workers vs Iframes

**Decision**: **Iframes** (not Web Workers)

**Rationale**:

1. **DOM Access**: Web Workers cannot access DOM, but learners need to manipulate HTML elements
2. **Visual Feedback**: Iframes provide visual rendering, essential for HTML/CSS learning
3. **Isolation**: Both provide security isolation, but iframes are more battle-tested for untrusted code
4. **Compatibility**: Iframes have better browser support than SharedArrayBuffer (Web Workers requirement)

**Hybrid Approach**: Use Web Workers for JavaScript-only challenges (future optimization)

#### Memory and Execution Time Limiting

**Techniques**:

1. **Execution Time Limiting**:

```javascript
// In iframe:
const executionTimeout = 5000; // 5 seconds
const timeoutHandle = setTimeout(() => {
  window.stop(); // Stop all execution
  parent.postMessage({ type: 'EXECUTION_TIMEOUT' }, '*');
}, executionTimeout);

// Execute user code
try {
  eval(userCode);
  clearTimeout(timeoutHandle);
  parent.postMessage({ type: 'EXECUTION_SUCCESS' }, '*');
} catch (error) {
  clearTimeout(timeoutHandle);
  parent.postMessage({ type: 'EXECUTION_ERROR', error: error.message }, '*');
}
```

2. **Memory Limiting**:

   - Browser-enforced: Iframes inherit memory limits from the main page
   - Monitoring: Use `performance.memory` API (Chrome) to track usage
   - Hard Limit: Terminate iframe if memory usage exceeds 50MB

3. **Infinite Loop Detection**:
   - Static Analysis: Use ESLint rules to detect obvious infinite loops before execution
   - Runtime Monitoring: Track execution time and terminate if exceeding threshold
   - User Warning: Show message: "Your code is taking too long. Check for infinite loops."

#### Best Practices

1. **Iframe Lifecycle**: Create new iframe for each code execution (don't reuse)
2. **Communication**: Use `postMessage` API for parent-iframe communication
3. **Error Handling**: Catch and sanitize error messages before displaying to users
4. **Network Blocking**: Block fetch/XHR requests in sandbox (use `sandbox` attribute)
5. **Storage Blocking**: Block localStorage/sessionStorage access in sandbox

---

## 5. Guest Trial Implementation

### Research Findings

#### Local Storage vs IndexedDB

**Decision**: **Local Storage** (with IndexedDB as future enhancement)

**Rationale**:

1. **Simplicity**: localStorage has simpler API, sufficient for MVP trial tracking
2. **Size**: Guest trial state (~50KB: user ID, XP, progress) fits within localStorage 5MB limit
3. **Sync vs Async**: localStorage is synchronous, easier to use with Zustand persist middleware
4. **Browser Support**: localStorage has universal support (100% of modern browsers)

**IndexedDB Benefits** (future):

- Larger storage capacity (50MB+)
- Better performance for large datasets
- Structured data storage with indexes
- **Use case**: If storing all lesson content offline for disconnected learning

#### Server-Side Trial Validation

**Pattern**: Hybrid Client-Server Tracking

```typescript
// Client-side (localStorage)
interface GuestTrialState {
  guestId: string; // UUID generated on first visit
  createdAt: timestamp;
  expiresAt: timestamp; // createdAt + 30 days
  lastSyncedAt: timestamp;
}

// Server-side (Supabase)
table guest_trials {
  guest_id: uuid primary key;
  created_at: timestamptz;
  expires_at: timestamptz;
  last_activity: timestamptz;
  progress_snapshot: jsonb; // Periodic backups of user progress
}
```

**Validation Strategy**:

1. **Client-Side Check**: On page load, check localStorage for trial expiration
2. **Server-Side Verification**: On every API call, verify trial status in database
3. **Grace Period**: Allow 24-hour grace period after expiration (soft limit)
4. **Hard Cutoff**: After grace period, show registration prompt and disable learning features

**Best Practices**:

1. **Sync Frequency**: Sync localStorage to server every 5 minutes or on page unload
2. **Conflict Resolution**: Server state is source of truth if client/server disagree
3. **Anonymous Recovery**: Store `guestId` in both localStorage and URL parameter for recovery
4. **Trial Extension**: Support one-time 7-day extension for users who show engagement

#### Progress Migration (Guest → Registered)

**Pattern**: Atomic Migration Transaction

```sql
BEGIN TRANSACTION;

-- Create registered user
INSERT INTO users (email, password_hash, user_type, created_at)
VALUES (?, ?, 'student', NOW())
RETURNING id AS new_user_id;

-- Migrate progress
UPDATE user_progress
SET user_id = new_user_id
WHERE guest_id = ?;

-- Migrate projects
UPDATE projects
SET user_id = new_user_id, is_guest = FALSE
WHERE guest_id = ?;

-- Migrate XP and achievements
UPDATE user_xp
SET user_id = new_user_id
WHERE guest_id = ?;

-- Mark guest trial as migrated
UPDATE guest_trials
SET migrated_at = NOW(), migrated_to_user_id = new_user_id
WHERE guest_id = ?;

COMMIT;
```

**Error Handling**:

- **Rollback on Failure**: If any step fails, rollback entire transaction
- **Idempotency**: Check if migration already happened before retrying
- **Data Validation**: Verify all data integrity before committing

**Best Practices**:

1. **Preserve Everything**: Migrate ALL data (XP, achievements, projects, AI conversations)
2. **Email Verification**: Send verification email after registration (Supabase Auth handles this)
3. **Welcome Flow**: Show "Migration Successful" message with progress summary
4. **Data Cleanup**: Mark guest records as migrated (don't delete for analytics)

---

## 6. Supabase Edge Functions

### Research Findings

#### Cold Start Optimization

**Problem**: Edge Functions (Deno runtime) can have 100-500ms cold starts, impacting SC-003 (AI response <5s)

**Mitigation Strategies**:

1. **Keep-Warm Mechanism**:

```typescript
// Scheduled function that pings Edge Functions every 5 minutes
// Cron: */5 * * * * (every 5 minutes)
export async function keepWarm() {
  await fetch('https://your-project.supabase.co/functions/v1/ai-proxy', {
    method: 'POST',
    body: JSON.stringify({ type: 'KEEP_WARM' })
  });
}
```

2. **Minimal Dependencies**:

   - Avoid heavy npm packages in Edge Functions
   - Use native Deno modules where possible
   - Bundle only essential code

3. **Connection Pooling**:

   - Reuse HTTP connections to AI providers
   - Cache database connections (Supabase client is automatically pooled)

4. **Lazy Initialization**:
   - Initialize AI provider clients on first request, not on function startup
   - Cache initialized clients in global scope

**Benchmark Target**: Cold start <300ms, warm start <50ms

#### Deno Runtime Best Practices

**Import Maps** (`deno.json`):

```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2",
    "std/": "https://deno.land/std@0.208.0/"
  }
}
```

**Error Handling**:

```typescript
import { serve } from 'std/http/server.ts';

serve(async (req) => {
  try {
    const response = await handleRequest(req);
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
```

**Logging**:

```typescript
// Structured logging for observability
console.log(
  JSON.stringify({
    level: 'info',
    message: 'AI request processed',
    userId: req.headers.get('user-id'),
    provider: 'deepseek',
    latency: responseTime,
    timestamp: new Date().toISOString()
  })
);
```

#### AI Proxy Implementation

**Purpose**: Centralize AI provider calls, implement rate limiting, and handle failover

```typescript
// supabase/functions/ai-proxy/index.ts
import { serve } from 'std/http/server.ts';
import { AIProviderManager } from './providers.ts';
import { RateLimiter } from './rate-limiter.ts';
import { CacheManager } from './cache.ts';

const providerManager = new AIProviderManager();
const rateLimiter = new RateLimiter();
const cache = new CacheManager();

serve(async (req) => {
  const { prompt, userId, type } = await req.json();

  // Rate limiting
  if (!(await rateLimiter.checkUserLimit(userId))) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Check cache
  const cached = await cache.get(prompt);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Call AI provider with fallback
  const response = await providerManager.getResponse(prompt, type);

  // Cache response
  await cache.set(prompt, response);

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**Benefits**:

- **Security**: API keys never exposed to client
- **Rate Limiting**: Enforced server-side
- **Caching**: Shared cache across all users
- **Monitoring**: Centralized logging and metrics
- **Cost Control**: Track AI API usage in one place

---

## 7. Internationalization (i18n)

### Decision: **astro-i18next**

### Rationale

**astro-i18next** is chosen for its Astro-specific optimizations:

1. **SSR Support**: Pre-renders translations at build time for static pages
2. **File-Based Routing**: Supports `/en/`, `/zh/` URL patterns
3. **JSON Translation Files**: Simple key-value format
4. **TypeScript Support**: Auto-generated types for translation keys
5. **Lightweight**: Minimal runtime overhead

### Alternatives Considered

- **Manual Implementation**: Too much boilerplate, error-prone
- **react-i18next**: React-specific, doesn't integrate well with Astro pages
- **Format.js**: More powerful but overkill for this project's needs

### Implementation Notes

**Directory Structure**:

```
src/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── lessons.json
│   │   └── errors.json
│   └── zh/
│       ├── common.json
│       ├── lessons.json
│       └── errors.json
```

**Configuration** (`astro.config.mjs`):

```javascript
import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';

export default defineConfig({
  integrations: [
    astroI18next({
      defaultLocale: 'en',
      locales: ['en', 'zh'],
      routes: {
        zh: {
          learn: 'xuexi',
          community: 'shequ',
          leaderboard: 'paihangbang'
        }
      }
    })
  ]
});
```

**Translation Management**:

- **Tool**: Use Crowdin or Lokalise for collaborative translation
- **Workflow**: English (source) → AI translation → Human review
- **Fallback**: If translation missing, show English text

**AI Language Support**:

- **Prompt Engineering**: Include language preference in AI prompts
- **Response Format**: Request AI to respond in user's language
- **Validation**: Check if AI response matches requested language

---

## Summary of Decisions

| Technology Area      | Decision                    | Key Benefit                          |
| -------------------- | --------------------------- | ------------------------------------ |
| **Code Editor**      | Monaco Editor               | Superior IntelliSense, VS Code UX    |
| **State Management** | Zustand                     | Lightweight (3KB), simple API        |
| **AI Failover**      | Waterfall + Circuit Breaker | High availability, cost optimization |
| **AI Caching**       | LRU + Semantic Similarity   | Reduced API costs, faster responses  |
| **Sandbox Security** | Iframe + CSP                | Proven security model, DOM access    |
| **Trial Tracking**   | localStorage + Server Sync  | Simple, reliable, recoverable        |
| **Edge Functions**   | Keep-Warm + Minimal Deps    | Low latency, cost-effective          |
| **i18n**             | astro-i18next               | SSR support, file-based routing      |

---

## Open Questions

None remaining - all NEEDS CLARIFICATION items have been resolved.

---

## References

- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [astro-i18next](https://github.com/yassinedoghri/astro-i18next)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)

---

**Status**: ✅ Phase 0 Research Complete  
**Next**: Phase 1 - Generate data-model.md and API contracts
