# 🚀 快速修复检查清单

## ⚠️ 当前问题

部署成功，但以下功能不可用：
- ❌ 学习页面 (/learn)
- ❌ 代码沙箱 (/sandbox)
- ❌ 游客试用功能
- ❌ Blobs API
- ❌ Edge Functions

**根本原因**: 缺少必需的环境变量配置

---

## ✅ 修复步骤（按顺序执行）

### 第 1 步：配置 Supabase 环境变量 ⭐ 最重要

1. **获取 Supabase 凭据**
   ```bash
   # 访问 Supabase 仪表板
   https://supabase.com/dashboard
   
   # 导航到：你的项目 → Settings → API
   # 复制以下信息：
   # - Project URL (例如：https://xxxxx.supabase.co)
   # - anon public key
   # - service_role key (保密！)
   ```

2. **在 Netlify 中设置变量**
   ```bash
   # 方法 A：使用 Netlify UI
   # 访问：https://app.netlify.com/projects/codegameapssk/configuration/env
   # 点击 "Add a variable" 并添加：
   
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbG...（你的 anon key）

   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...（你的 service role key）
   SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.5OwKY1I5w8lG1NWyVNAbEgdS3tARyHHwbAuvU0H_Tdc
   ```

   或
   
   ```bash
   # 方法 B：使用 CLI
   netlify env:set SUPABASE_URL "https://your-project.supabase.co"
   netlify env:set SUPABASE_ANON_KEY "your-anon-key"
   netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-service-role-key"
   ```

### 第 2 步：配置 DeepSeek AI 密钥

1. **获取 DeepSeek API 密钥**
   ```bash
   # 访问：https://platform.deepseek.com/
   # 注册/登录 → API Keys → 创建新密钥
   ```

2. **设置环境变量**
   ```bash
   # 在 Netlify 中添加
   DEEPSEEK_API_KEY=sk-your-api-key-here
   ```

### 第 3 步：设置可选的公开变量

```bash
PUBLIC_SITE_URL=https://acomputers.icu
PUBLIC_DISABLE_UPLOADS=false
```

### 第 4 步：重新部署

```bash
# 方法 A：通过 CLI
netlify deploy --prod

# 方法 B：通过 UI
# 访问：https://app.netlify.com/projects/codegameapssk/deploys
# 点击 "Trigger deploy" → "Deploy site"
```

### 第 5 步：验证修复

访问以下 URL 检查是否正常：

- [ ] https://acomputers.icu (首页)
- [ ] https://acomputers.icu/learn (学习页面)
- [ ] https://acomputers.icu/sandbox (代码沙箱)
- [ ] https://acomputers.icu/blobs (Blobs 功能)
- [ ] https://acomputers.icu/image-cdn (图片 CDN)

---

## 🔍 验证命令

```bash
# 1. 检查环境变量是否已设置
netlify env:list

# 2. 测试游客登录 API
curl -X POST https://acomputers.icu/api/auth/guest

# 3. 查看部署日志
netlify logs:function

# 4. 检查 Supabase 连接
# 在浏览器控制台执行：
# fetch('https://your-project.supabase.co/rest/v1/').then(r => console.log(r.status))
```

---

## ⏱️ 预计完成时间

- 配置环境变量：5-10 分钟
- 重新部署：2-3 分钟
- 验证功能：3-5 分钟

**总计：约 15 分钟**

---

## 📋 快速参考

### 需要的环境变量清单

```bash
✅ SUPABASE_URL                  # 从 Supabase Dashboard 获取
✅ SUPABASE_ANON_KEY             # 从 Supabase Dashboard 获取
✅ SUPABASE_SERVICE_ROLE_KEY     # 从 Supabase Dashboard 获取（保密）
✅ DEEPSEEK_API_KEY              # 从 DeepSeek Platform 获取（保密）
⚪ PUBLIC_SITE_URL               # 可选：https://acomputers.icu
⚪ PUBLIC_DISABLE_UPLOADS        # 可选：false
```

### Netlify CLI 快捷命令

```bash
# 安装 CLI（如果还没有）
npm install -g netlify-cli

# 登录
netlify login

# 链接项目
netlify link

# 设置环境变量
netlify env:set KEY "value"

# 列出所有环境变量
netlify env:list

# 部署
netlify deploy --prod

# 查看实时日志
netlify logs:function --live
```

---

## 🐛 常见错误及解决方案

### 错误 1: "Page not found" (404)

**症状**: 访问 `/learn` 或 `/api/auth/guest` 返回 404

**解决方案**:
1. 确认环境变量已设置
2. 重新部署项目
3. 清除浏览器缓存

### 错误 2: Supabase 连接失败

**症状**: 控制台显示 "Failed to initialize Supabase client"

**解决方案**:
1. 检查 `SUPABASE_URL` 格式是否正确
2. 验证 API keys 是否有效
3. 确认 Supabase 项目状态正常

### 错误 3: "This function has crashed"

**症状**: API 调用返回函数崩溃错误

**解决方案**:
1. 查看函数日志：`netlify logs:function`
2. 确认所有环境变量都已设置
3. 检查是否有语法错误

---

## 📊 测试报告

完整的测试报告请查看：`DEPLOYMENT_TEST_REPORT.md`

---

## 💡 提示

1. **环境变量更改后必须重新部署**
2. **Service Role Key 要保密，不要暴露在客户端**
3. **使用 `netlify dev` 进行本地测试**
4. **建议设置 Netlify 的构建通知**

---

## 📞 获取帮助

如果按照此清单操作后仍有问题：

1. 检查 Netlify 函数日志
2. 查看浏览器控制台错误
3. 参考 `ENVIRONMENT_SETUP_GUIDE.md` 详细文档
4. 查看 Supabase 项目健康状态

---

## 🎯 成功标志

当所有步骤完成后，你应该能：

✅ 访问首页并看到完整内容  
✅ 点击 "Start Learning Now" 成功创建游客账号  
✅ 进入学习页面查看课程列表  
✅ 在代码沙箱中编写和运行代码  
✅ 使用 Blobs 功能上传和查看形状  

**祝你好运！🚀**

