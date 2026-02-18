# 部署指南

本文档详细说明如何将 Next.js 博客项目部署到 Vercel，并配置 Cloudflare CDN 加速。

---

## 📋 目录

1. [前置准备](#前置准备)
2. [GitHub 推送](#github-推送)
3. [Vercel 部署](#vercel-部署)
4. [Cloudflare 配置](#cloudflare-配置)
5. [Hexo 平滑迁移](#hexo-平滑迁移)
6. [常见问题](#常见问题)

---

## 前置准备

### 需要的账号

- [GitHub 账号](https://github.com)
- [Vercel 账号](https://vercel.com)（可用 GitHub 登录）
- [Cloudflare 账号](https://dash.cloudflare.com)
- 一个已注册的域名（如 unicorn777-bot.github.io 的自定义域名）

### 本地环境要求

- Node.js >= 18.0.0
- Git
- PostgreSQL 数据库（推荐使用 Vercel Postgres 或 Neon）

---

## GitHub 推送

### 1. 初始化 Git 仓库

```bash
# 进入项目目录
cd D:\桌面\blog.new\next-blog

# 初始化 Git（如果尚未初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化 Next.js 博客项目"
```

### 2. 创建 GitHub 仓库

**方式一：创建新仓库（推荐）**

1. 访问 https://github.com/new
2. 仓库名称：`blog-nextjs` 或其他名称
3. 选择 Private 或 Public
4. 不要勾选 "Add a README file"（已有代码）
5. 点击 "Create repository"

**方式二：使用现有仓库**

如果想保留原有的 `unicorn777-bot.github.io` 仓库：
1. 创建新分支存放 Next.js 项目
2. 或在仓库中创建 `nextjs` 子目录

### 3. 推送到 GitHub

```bash
# 添加远程仓库（替换为你的用户名和仓库名）
git remote add origin https://github.com/你的用户名/blog-nextjs.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 4. 重要文件检查

确保以下文件已包含：

```
next-blog/
├── .gitignore          # Git 忽略文件
├── .env.example        # 环境变量示例（不要提交 .env.local）
├── vercel.json         # Vercel 配置
├── package.json        # 依赖配置
└── README.md           # 项目文档
```

**.gitignore 示例：**

```gitignore
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# next.js
.next/
out/
build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

## Vercel 部署

### 1. 创建 Vercel 项目

1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

### 2. 配置项目

**Framework Preset:** Next.js（自动检测）

**Root Directory:** `next-blog`（如果在子目录中）

**Build Command:** `npm run build`（默认）

**Output Directory:** `.next`（默认）

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `POSTGRES_URL` | `postgres://...` | PostgreSQL 连接字符串 |
| `POSTGRES_PRISMA_URL` | `postgres://...` | Prisma 连接字符串 |
| `POSTGRES_URL_NON_POOLING` | `postgres://...` | 非池化连接 |
| `POSTGRES_USER` | `用户名` | 数据库用户 |
| `POSTGRES_HOST` | `主机地址` | 数据库主机 |
| `POSTGRES_PASSWORD` | `密码` | 数据库密码 |
| `POSTGRES_DATABASE` | `数据库名` | 数据库名称 |
| `NEXTAUTH_SECRET` | `随机字符串` | 至少32字符的随机字符串 |
| `NEXTAUTH_URL` | `https://你的域名.com` | 生产环境URL |
| `REVALIDATE_SECRET` | `随机字符串` | ISR重新验证密钥 |

**生成随机密钥：**

```bash
# 生成 NEXTAUTH_SECRET
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. 添加数据库（推荐 Vercel Postgres）

1. 在 Vercel 项目中，点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "Postgres"
4. 选择区域（推荐 Hong Kong 或 Singapore）
5. 创建后会自动添加环境变量

### 5. 部署

点击 "Deploy" 按钮，等待构建完成。

### 6. 初始化数据库

部署成功后：

1. 本地安装 Vercel CLI：`npm i -g vercel`
2. 登录：`vercel login`
3. 链接项目：`vercel link`
4. 拉取环境变量：`vercel env pull .env.local`
5. 运行初始化脚本：

```bash
npm run seed

# 如果需要从 Hexo 迁移
npx tsx scripts/migrate-from-hexo.ts
```

### 7. 配置自定义域名

1. 在 Vercel 项目中，点击 "Settings" > "Domains"
2. 添加你的域名（如 `yourdomain.com`）
3. Vercel 会提供 DNS 记录配置

---

## Cloudflare 配置

### 1. 添加站点到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击 "Add a Site"
3. 输入你的域名
4. 选择计划（Free 即可）

### 2. 更新域名 DNS 服务器

Cloudflare 会提供两个名称服务器，如：
- `ada.ns.cloudflare.com`
- `bob.ns.cloudflare.com`

在域名注册商处更新 DNS 服务器。

### 3. 配置 DNS 记录

**方式一：使用 Vercel 域名（推荐）**

| 类型 | 名称 | 内容 | 代理状态 | TTL |
|------|------|------|----------|-----|
| CNAME | @ | cname.vercel-dns.com | 已代理 | 自动 |
| CNAME | www | cname.vercel-dns.com | 已代理 | 自动 |

**方式二：使用 Vercel IP**

| 类型 | 名称 | 内容 | 代理状态 | TTL |
|------|------|------|----------|-----|
| A | @ | 76.76.21.21 | 已代理 | 自动 |
| CNAME | www | 你的域名.com | 已代理 | 自动 |

### 4. SSL/TLS 配置

1. 进入 "SSL/TLS" > "Overview"
2. 选择 **Full (Strict)** 模式
   - Full：Cloudflare 到源站使用 HTTPS，但不验证证书
   - Full (Strict)：验证源站证书（推荐）

### 5. 安全设置

**SSL/TLS > Edge Certificates：**

- ✅ Always Use HTTPS：开启
- ✅ Automatic HTTPS Rewrites：开启
- ✅ Minimum TLS Version：1.2
- ✅ Opportunistic Encryption：开启

**Security > Settings：**

- Security Level：Medium
- Challenge Passage：30 minutes
- Browser Integrity Check：开启

### 6. 性能优化

**Speed > Optimization：**

- ✅ Auto Minify：HTML, CSS, JavaScript 全选
- ✅ Brotli：开启
- ✅ Early Hints：开启
- ✅ Rocket Loader：关闭（可能与 Next.js 冲突）

**Caching > Configuration：**

- Caching Level：Standard
- Browser Cache TTL：4 hours 或更长

**Page Rules（可选）：**

创建以下规则优化缓存：

```
规则 1：静态资源缓存
URL: *你的域名.com/_next/static/*
设置：
- Cache Level: Cache Everything
- Edge Cache TTL: 1 year
- Browser Cache TTL: 1 year

规则 2：图片缓存
URL: *你的域名.com/images/*
设置：
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month

规则 3：API 不缓存
URL: *你的域名.com/api/*
设置：
- Cache Level: Bypass
```

### 7. 隐藏源站 IP

Cloudflare 代理模式已自动隐藏源站 IP。额外保护措施：

1. **禁止直接 IP 访问**（Vercel 自动处理）
2. **在 Vercel 中设置防火墙规则**：
   - 只允许 Cloudflare IP 访问（可选，Vercel 通常不需要）

### 8. Cloudflare Workers（可选）

创建 Worker 添加安全头：

```javascript
// Cloudflare Worker 代码
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  
  // 添加安全头
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('X-XSS-Protection', '1; mode=block')
  
  return newResponse
}
```

---

## Hexo 平滑迁移

### 迁移策略

从 Hexo GitHub Pages 迁移到 Next.js Vercel，保证零停机：

### 步骤 1：准备工作

1. 确保新 Next.js 博客已部署到 Vercel
2. 确保所有文章已迁移
3. 测试新站点所有功能正常

### 步骤 2：URL 兼容性检查

Next.js 已配置 Hexo 兼容路由：

```
# 原有 Hexo 链接格式
https://yourdomain.com/2025/05/29/article-title/

# Next.js 支持相同格式
/[year]/[month]/[day]/[slug]/page.tsx
```

### 步骤 3：DNS 切换

**方式一：CNAME 切换（推荐）**

原 GitHub Pages 配置：
```
CNAME @ 你的用户名.github.io
```

新 Vercel 配置：
```
CNAME @ cname.vercel-dns.com
```

**切换步骤：**

1. 在 Cloudflare 中修改 DNS 记录
2. 将 CNAME 从 `你的用户名.github.io` 改为 `cname.vercel-dns.com`
3. 保存后等待 DNS 传播（通常几分钟到几小时）

**方式二：渐进式切换**

1. 先配置子域名测试：
   ```
   CNAME next 你的域名.com -> cname.vercel-dns.com
   ```
2. 访问 `next.你的域名.com` 测试
3. 确认无误后切换主域名

### 步骤 4：301 重定向（可选）

如果某些 URL 格式不同，在 Cloudflare 设置重定向：

**Page Rules > Forwarding URL：**

```
# 示例：旧格式重定向到新格式
If the URL matches: yourdomain.com/post/old-slug/*
Then forward to: https://yourdomain.com/posts/old-slug
```

### 步骤 5：验证迁移

1. 检查所有文章链接是否正常
2. 检查图片是否正常加载
3. 检查分类和标签页面
4. 使用 Google Search Console 提交新站点地图

### 步骤 6：更新搜索引擎

1. **Google Search Console**：
   - 添加新网站属性
   - 提交站点地图：`https://你的域名.com/sitemap.xml`
   - 请求索引重要页面

2. **百度站长平台**（如需要）：
   - 添加网站
   - 提交站点地图
   - 使用推送接口

### 步骤 7：保留旧站点（过渡期）

建议保留 GitHub Pages 站点 1-2 周：

1. 在 GitHub Pages 仓库添加重定向页面
2. 或使用 Cloudflare Workers 处理旧链接

---

## 常见问题

### Q1: 构建失败怎么办？

检查 Vercel 构建日志：
```bash
# 本地测试构建
npm run build
```

常见原因：
- 环境变量未配置
- 数据库连接失败
- 依赖版本问题

### Q2: 数据库连接失败？

1. 检查环境变量是否正确
2. 确认数据库允许 Vercel IP 访问
3. 使用 Vercel Postgres 可避免此问题

### Q3: 图片加载失败？

1. 检查图片路径是否正确
2. 确认图片已上传到 `public/images/`
3. 检查 Cloudflare 缓存设置

### Q4: 评论功能不工作？

1. 检查数据库 comments 表是否存在
2. 确认 `enable_comments` 设置为 `true`
3. 查看浏览器控制台错误

### Q5: ISR 不更新？

手动触发重新验证：
```bash
curl -X POST https://你的域名.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"你的REVALIDATE_SECRET","path":"/"}'
```

### Q6: Cloudflare 502 错误？

1. 检查 Vercel 部署状态
2. 确认 DNS 记录正确
3. 检查 SSL 模式是否为 Full (Strict)

---

## 部署检查清单

- [ ] GitHub 仓库已创建并推送代码
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] 数据库已创建并初始化
- [ ] 自定义域名已添加到 Vercel
- [ ] Cloudflare DNS 已配置
- [ ] SSL/TLS 已设置为 Full (Strict)
- [ ] 所有页面可正常访问
- [ ] 评论功能正常
- [ ] 后台管理可登录
- [ ] Google Search Console 已更新
- [ ] 原 Hexo 站点已处理

---

## 支持与反馈

如有问题，请：
1. 查看本文档常见问题部分
2. 检查 Vercel 部署日志
3. 检查 Cloudflare 分析面板
