# GameCode Lab - Environment Setup Guide

## Quick Start

1. Copy the environment variables below to create a `.env` file in the project root
2. Ensure `.env` is added to `.gitignore`
3. Configure the same variables in Netlify dashboard for production deployment

---

## Required Environment Variables

### Supabase Configuration

```bash
SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.5OwKY1I5w8lG1NWyVNAbEgdS3tARyHHwbAuvU0H_Tdc
```

### Primary AI Provider (DeepSeek)

```bash
DEEPSEEK_API_KEY=sk-6d326d3e272045868de050be8ddd698f
```

---

## Optional: Fallback AI Providers

Configure multiple AI providers for automatic failover and redundancy:

```bash
# Chinese AI Providers
GLM_API_KEY=1cf8de9e31b94d6ba77786f706de2ce7.uQB9GXSVrj8ykogF
MOONSHOT_API_KEY=sk-M2vL6A8EY9QhhdzdUodSi6jRZHp01fOFxhETQu3T1zTjuHyp
TONGYI_API_KEY=sk-5354ea96c69b44ed96705e8e446f84f9
TENCENT_API_KEY=sk-9oEqzHR0V9725Bl2YTWyDzsJBDuQbiQqwXrysk0N991R6IKt
SPARK_API_KEY=DdOqdySdMfPVdUPKleqG:oynXFFHutBcilZdqMvpK
DOUBAO_API_KEY=414f57a5-bca0-4e05-bca2-bd6b066e8165
MINIMAX_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLkuK3no4HmlbDmmbrvvIjljJfkuqzvvInnp5HmioDmnInpmZDlhazlj7giLCJVc2VyTmFtZSI6IuS4reejgeaVsOaZuu-8iOWMl-S6rO-8ieenkeaKgOaciemZkOWFrOWPuCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTE1NDI2OTQ3MDc3MjUxNTc1IiwiUGhvbmUiOiIxMzQyNjA4Njg2MSIsIkdyb3VwSUQiOiIxOTE1NDI2OTQ3MDM1MzA4NTM1IiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDQtMjYgMTE6NTk6NDgiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.sV21FKQXA8Ce3s5QHrz66a5cx8dgFVWVlGngtKVcmFgvegJwin7WedaxeWiY-pxGQjt_ZuieSaNGf6X2e33AJCHvIP4m88TX5jlp5Bp_Zw-heEa1J7yeOFo0cmftpJRW2MCcNrmySDPVmB2xeOYKXa7QdIApEXZlBOKtB5EZLEQbPa73HWQPOcveOCXxsq_DzsZQ2UQktlKC8PzFb_zcDmhQLnJJ9vFrpcfnmXCtMDKhBYvPYvRwtvwn6AdcVqSKOPv3kJNIeqIXU494zonpUczylQLyW7zFFRzCE-8My6CjXNp8rG_iWo5cupD7w2z5MP1qvHvVVGl0QyM_LxnSvQ

# International Providers
ANTHROPIC_API_KEY=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
GEMINI_API_KEY=AIzaSyB523dcmpFeTTiVde
DEEPAI_API_KEY=e77b709f-3558-42f3-b8f6-d2e257accfbc
```

---

## AI Provider Failover Strategy

The system implements automatic failover with this priority order:

1. **DeepSeek** (Primary) - Chinese model optimized for code
2. **GLM** (First fallback) - ChatGLM by Zhipu AI
3. **Moonshot** (Second fallback) - Kimi by Moonshot AI
4. **Tongyi** (Third fallback) - Alibaba Cloud
5. **Additional providers** as needed

**Implementation Logic:**

```javascript
async function getAIResponse(prompt) {
  const providers = [
    { name: 'DeepSeek', key: process.env.DEEPSEEK_API_KEY },
    { name: 'GLM', key: process.env.GLM_API_KEY },
    { name: 'Moonshot', key: process.env.MOONSHOT_API_KEY }
    // ... more providers
  ];

  for (const provider of providers) {
    if (!provider.key) continue;
    try {
      return await callAI(provider, prompt);
    } catch (error) {
      console.warn(`${provider.name} failed, trying next provider`);
      continue;
    }
  }

  throw new Error('All AI providers unavailable');
}
```

---

## Application Configuration

### Development Environment

```bash
NODE_ENV=development
PUBLIC_APP_URL=http://localhost:4321
```

### Production Environment (Netlify)

```bash
NODE_ENV=production
PUBLIC_APP_URL=https://your-domain.netlify.app
```

### Feature Configuration

```bash
# AI Settings
AI_RATE_LIMIT=100                    # Max requests per user per day
CODE_EXECUTION_TIMEOUT=5000          # Milliseconds
GUEST_TRIAL_DAYS=30                  # Trial period length

# Security
SESSION_SECRET=generate-random-string-here

# Feature Flags (true/false)
ENABLE_COMMUNITY=true
ENABLE_LEADERBOARD=true
ENABLE_AI_BOSS_CHALLENGES=false      # MVP: disabled
ENABLE_TEACHER_MODE=false            # MVP: disabled
ENABLE_ADMIN_MODE=false              # MVP: disabled
```

---

## Setup Instructions

### Local Development

1. **Create `.env` file in project root:**

   ```bash
   # Copy all environment variables from this document
   touch .env
   ```

2. **Verify `.gitignore` includes `.env`:**

   ```bash
   echo ".env" >> .gitignore
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Netlify Deployment

1. **Navigate to Netlify Dashboard** → Your Site → Site Settings → Environment Variables

2. **Add each variable individually:**

   - Variable name: `SUPABASE_URL`
   - Value: `https://zzyueuweeoakopuuwfau.supabase.co`
   - Context: All deploys
   - Click "Add variable"

3. **Repeat for all required variables**

4. **Trigger redeploy** after adding variables

---

## Security Best Practices

### ⚠️ CRITICAL: Never Commit Secrets

- ✅ **DO**: Store API keys in `.env` file (gitignored)
- ✅ **DO**: Use environment variables in Netlify dashboard
- ✅ **DO**: Rotate API keys regularly (quarterly recommended)
- ❌ **DON'T**: Commit `.env` to version control
- ❌ **DON'T**: Hardcode API keys in source code
- ❌ **DON'T**: Share API keys in chat/email/screenshots

### Key Rotation Schedule

- **Supabase Keys**: Rotate every 6 months or if compromised
- **AI Provider Keys**: Rotate quarterly or when reaching usage limits
- **Session Secrets**: Rotate monthly for production

### Monitoring

Set up alerts for:

- Unusual API usage spikes
- Failed authentication attempts
- AI provider failures
- Rate limit breaches

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution**: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correctly set

### Issue: "AI provider unavailable"

**Solution**:

1. Check if DeepSeek API key is valid
2. Ensure fallback providers are configured
3. Check API usage quotas
4. Review network connectivity

### Issue: "Environment variables not loading"

**Solution**:

1. Verify `.env` file exists in project root
2. Restart development server
3. Check for typos in variable names
4. Ensure `astro.config.mjs` loads env vars correctly

### Issue: "Rate limit exceeded"

**Solution**:

1. Increase `AI_RATE_LIMIT` value
2. Implement user-based throttling
3. Add caching for common queries
4. Upgrade AI provider plan

---

## Environment Variable Reference

| Variable                    | Required    | Default                 | Description                             |
| --------------------------- | ----------- | ----------------------- | --------------------------------------- |
| `SUPABASE_URL`              | ✅ Yes      | -                       | Supabase project URL                    |
| `SUPABASE_ANON_KEY`         | ✅ Yes      | -                       | Supabase anonymous key                  |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes      | -                       | Supabase service role key (server-only) |
| `DEEPSEEK_API_KEY`          | ✅ Yes      | -                       | Primary AI provider                     |
| `GLM_API_KEY`               | ⚪ Optional | -                       | Fallback AI provider                    |
| `NODE_ENV`                  | ⚪ Optional | `development`           | Environment mode                        |
| `PUBLIC_APP_URL`            | ⚪ Optional | `http://localhost:4321` | Application URL                         |
| `AI_RATE_LIMIT`             | ⚪ Optional | `100`                   | Max AI requests per user/day            |
| `CODE_EXECUTION_TIMEOUT`    | ⚪ Optional | `5000`                  | Max code execution time (ms)            |
| `GUEST_TRIAL_DAYS`          | ⚪ Optional | `30`                    | Guest trial duration                    |
| `SESSION_SECRET`            | ⚪ Optional | auto-generated          | Session encryption key                  |

---

## Next Steps

After environment setup:

1. ✅ Verify all required variables are set
2. ✅ Test Supabase connection
3. ✅ Test AI provider connectivity
4. ✅ Review feature flags for MVP scope
5. ✅ Configure monitoring and alerting
6. ✅ Document any additional custom variables

For implementation guidance, refer to `spec.md` in this directory.
