# 环境变量配置指南

## 📋 概述

本项目需要配置以下环境变量才能正常运行。这些变量需要在 Netlify 项目设置中配置。

---

## 🔑 必需的环境变量

### 1. Supabase 配置

项目使用 Supabase 作为后端数据库和认证服务。

| 变量名 | 说明 | 获取方式 |
|-------|------|---------|
| `SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | 匿名访问密钥（公开安全） | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务角色密钥（服务端使用，保密） | Supabase Dashboard → Settings → API |

**获取步骤**:
1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 导航到 Settings → API
4. 复制 URL 和 API keys

### 2. AI 配置

项目使用 DeepSeek AI 提供智能辅导功能。

| 变量名 | 说明 | 获取方式 |
|-------|------|---------|
| `DEEPSEEK_API_KEY` | DeepSeek AI API 密钥 | https://platform.deepseek.com/ |

**获取步骤**:
1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 导航到 API Keys
4. 创建新的 API 密钥

---

## 🔧 可选的环境变量

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| `PUBLIC_SITE_URL` | 网站公开 URL | - |
| `PUBLIC_DISABLE_UPLOADS` | 禁用文件上传 | `false` |

---

## 📝 在 Netlify 中配置环境变量

### 方法 1: 通过 Netlify UI

1. 访问 https://app.netlify.com/projects/codegameapssk
2. 导航到 **Site configuration → Environment variables**
3. 点击 **Add a variable**
4. 添加以下变量：

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DEEPSEEK_API_KEY=sk-...
PUBLIC_SITE_URL=https://acomputers.icu
```

5. 点击 **Save**

### 方法 2: 通过 Netlify CLI

```bash
# 设置单个环境变量
netlify env:set SUPABASE_URL "https://your-project.supabase.co"
netlify env:set SUPABASE_ANON_KEY "your-anon-key"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-service-role-key"
netlify env:set DEEPSEEK_API_KEY "your-api-key"

# 或者从 .env 文件导入（不要提交 .env 文件到 git）
netlify env:import .env
```

---

## 🔒 安全注意事项

### ⚠️ 保密的变量（不要暴露在客户端）
- `SUPABASE_SERVICE_ROLE_KEY` - 仅服务端使用
- `DEEPSEEK_API_KEY` - 仅服务端使用

### ✅ 公开安全的变量（可以在客户端使用）
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PUBLIC_SITE_URL`
- `PUBLIC_DISABLE_UPLOADS`

**重要提示**:
- 不要将 `.env` 文件提交到 Git 仓库
- `.env` 已经在 `.gitignore` 中
- 使用 `.env.example` 作为模板

---

## 🧪 本地开发配置

### 1. 创建 .env 文件

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入实际的值
```

### 2. 使用 Netlify Dev

```bash
# Netlify Dev 会自动加载 .env 文件
netlify dev
```

---

## ✅ 验证配置

配置完成后，执行以下检查：

### 1. 检查 Supabase 连接

访问：https://acomputers.icu/api/health（需要创建此端点）

或在浏览器控制台执行：
```javascript
fetch('https://acomputers.icu/api/auth/guest', {method: 'POST'})
  .then(r => r.json())
  .then(console.log)
```

### 2. 检查环境变量（Netlify CLI）

```bash
# 列出所有环境变量
netlify env:list

# 查看特定变量（不显示值）
netlify env:get SUPABASE_URL
```

---

## 🔄 重新部署

配置完环境变量后，需要重新部署项目：

### 通过 Netlify UI
1. 访问 https://app.netlify.com/projects/codegameapssk/deploys
2. 点击 **Trigger deploy → Deploy site**

### 通过 CLI
```bash
# 部署到生产环境
netlify deploy --prod

# 或触发构建
netlify build
```

---

## 🐛 常见问题

### Q: 配置后页面仍然返回 404？
**A**: 确保已重新部署项目。环境变量的更改需要重新构建。

### Q: Supabase 连接失败？
**A**: 检查：
1. Supabase 项目是否正常运行
2. URL 和密钥是否正确
3. 是否启用了 Row Level Security (RLS)

### Q: DeepSeek API 调用失败？
**A**: 检查：
1. API 密钥是否有效
2. 是否有足够的配额
3. 网络是否可以访问 DeepSeek API

---

## 📞 需要帮助？

如果遇到问题，请查看：
- [Netlify 环境变量文档](https://docs.netlify.com/environment-variables/overview/)
- [Supabase 文档](https://supabase.com/docs)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

---

## 📚 相关文件

- `.env.example` - 环境变量模板
- `src/lib/supabase/client.ts` - Supabase 客户端配置
- `src/lib/ai/fallback.ts` - AI 配置
- `netlify.toml` - Netlify 配置文件

