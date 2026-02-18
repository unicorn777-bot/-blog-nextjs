# Next-Blog - 现代化动态博客系统

基于 Next.js App Router、TypeScript、Serverless API 和 Vercel Postgres 构建的现代化博客系统，支持 ISR 增量渲染，完美适配 Serverless 场景。

## 📋 项目介绍

Next-Blog 是一个功能完整的动态博客系统，采用最新的 Next.js 15 技术栈，提供：

- ✅ **现代化架构**: Next.js 15 App Router + TypeScript
- ✅ **Serverless 数据库**: Vercel Postgres，完美适配 Serverless 场景
- ✅ **ISR 增量渲染**: 静态生成 + 按需更新，兼顾性能和实时性
- ✅ **完整的后台管理**: 文章、分类、标签管理，支持 Markdown 编辑
- ✅ **权限控制**: 基于 NextAuth 的用户认证和角色权限
- ✅ **数据迁移**: 支持从 Hexo 博客一键迁移
- ✅ **响应式设计**: Tailwind CSS，支持暗色模式
- ✅ **SEO 优化**: 自动生成 sitemap、meta 标签

## 🏗️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.1.3 | React 框架，App Router |
| **TypeScript** | 5.7.2 | 类型安全 |
| **Vercel Postgres** | 0.10.0 | Serverless 数据库 |
| **NextAuth.js** | 4.24.11 | 用户认证 |
| **Tailwind CSS** | 4.0.0 | 样式框架 |
| **Zod** | 3.24.1 | 数据验证 |
| **Marked** | 15.0.4 | Markdown 解析 |
| **bcryptjs** | 2.4.3 | 密码加密 |

## 📁 项目结构

```
next-blog/
├── app/                        # Next.js App Router
│   ├── api/                    # API 路由
│   │   ├── auth/              # NextAuth 认证
│   │   ├── posts/             # 文章接口
│   │   ├── categories/        # 分类接口
│   │   ├── tags/              # 标签接口
│   │   ├── admin/             # 管理后台接口
│   │   └── migrate/           # 数据迁移接口
│   ├── admin/                 # 管理后台页面
│   │   ├── login/             # 登录页
│   │   └── page.tsx           # 管理首页
│   ├── categories/            # 分类页面
│   ├── tags/                  # 标签页面
│   ├── posts/                 # 文章详情页
│   └── page.tsx               # 首页
├── components/                 # React 组件
│   ├── admin/                 # 管理后台组件
│   │   ├── AdminDashboard.tsx # 管理面板
│   │   ├── PostEditor.tsx     # 文章编辑器
│   │   ├── CategoryManager.tsx # 分类管理
│   │   ├── TagManager.tsx     # 标签管理
│   │   └── MigrationTool.tsx  # 迁移工具
│   └── PostCard.tsx           # 文章卡片
├── lib/                        # 工具库
│   ├── db.ts                  # 数据库操作
│   ├── auth.ts                # 认证配置
│   ├── markdown.ts            # Markdown 处理
│   ├── migration.ts           # 数据迁移
│   └── utils.ts               # 通用工具
├── sql/                        # SQL 脚本
│   └── init.sql               # 数据库初始化
├── scripts/                    # 脚本
│   └── seed.ts                # 数据库种子数据
├── public/                     # 静态资源
│   └── images/                # 图片资源
├── .env.local                  # 环境变量（本地）
├── .env.example                # 环境变量示例
├── next.config.ts              # Next.js 配置
├── tailwind.config.ts          # Tailwind 配置
└── package.json                # 项目依赖
```

## 🗄️ 数据库表结构

### users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR(255) | 邮箱（唯一） |
| name | VARCHAR(255) | 用户名 |
| password_hash | VARCHAR(255) | 密码哈希 |
| role | VARCHAR(50) | 角色：admin/editor/viewer |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### posts (文章表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR(500) | 标题 |
| slug | VARCHAR(500) | URL 别名（唯一） |
| content | TEXT | Markdown 内容 |
| excerpt | TEXT | 摘要 |
| cover_image | VARCHAR(500) | 封面图片 URL |
| status | VARCHAR(50) | 状态：draft/published/archived |
| author_id | UUID | 作者 ID（外键） |
| view_count | INTEGER | 阅读量 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| published_at | TIMESTAMP | 发布时间 |

### categories (分类表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(255) | 分类名称（唯一） |
| slug | VARCHAR(255) | URL 别名（唯一） |
| description | TEXT | 描述 |
| created_at | TIMESTAMP | 创建时间 |

### tags (标签表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(255) | 标签名称（唯一） |
| slug | VARCHAR(255) | URL 别名（唯一） |
| created_at | TIMESTAMP | 创建时间 |

### post_categories (文章分类关联表)
| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | UUID | 文章 ID（外键） |
| category_id | UUID | 分类 ID（外键） |

### post_tags (文章标签关联表)
| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | UUID | 文章 ID（外键） |
| tag_id | UUID | 标签 ID（外键） |

## 🔌 API 接口清单

### 认证接口
- `GET /api/auth/[...nextauth]` - NextAuth 认证
- `POST /api/auth/[...nextauth]` - 登录

### 文章接口
- `GET /api/posts` - 获取文章列表（公开）
  - 参数：`page`, `limit`, `category`, `tag`
  - 返回：文章列表 + 分页信息
- `POST /api/posts` - 创建文章（需要认证）
  - Body：`title`, `content`, `excerpt`, `cover_image`, `status`, `categories`, `tags`
- `GET /api/posts/[slug]` - 获取单篇文章（公开）
  - 返回：文章详情 + 分类 + 标签
- `PUT /api/posts/[slug]` - 更新文章（需要认证）
  - Body：同创建
- `DELETE /api/posts/[slug]` - 删除文章（需要认证）

### 分类接口
- `GET /api/categories` - 获取分类列表（公开）
  - 返回：分类列表 + 文章数量
- `POST /api/categories` - 创建分类（需要认证）
  - Body：`name`, `description`

### 标签接口
- `GET /api/tags` - 获取标签列表（公开）
  - 返回：标签列表 + 文章数量
- `POST /api/tags` - 创建标签（需要认证）
  - Body：`name`

### 管理后台接口
- `GET /api/admin/posts` - 获取所有文章（包括草稿，需要认证）
  - 参数：`page`, `limit`, `status`
  - 返回：文章列表 + 分页信息

### 数据迁移接口
- `POST /api/migrate` - 从 Hexo 迁移数据（需要认证）
  - Body：`hexoPath`, `authorEmail`
  - 返回：迁移结果

## 🚀 本地运行方法

### 1. 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. 安装依赖
```bash
cd next-blog
npm install
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，配置以下变量：

```env
# Database
POSTGRES_URL=postgresql://user:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://user:password@host:port/database?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:port/database
POSTGRES_USER=user
POSTGRES_HOST=host
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database

# NextAuth
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=欢迎来到2037
NEXT_PUBLIC_SITE_DESCRIPTION=这是一个关于未来科技和思考的博客
NEXT_PUBLIC_AUTHOR=Asta333
```

### 4. 初始化数据库

#### 使用 Vercel Postgres（推荐）
1. 在 Vercel 创建项目并连接 Postgres
2. 复制数据库连接字符串到 `.env.local`
3. 在 Vercel Dashboard 运行 `sql/init.sql` 中的 SQL

#### 使用本地 PostgreSQL
```bash
# 创建数据库
createdb next-blog

# 执行初始化脚本
psql -d next-blog -f sql/init.sql
```

### 5. 运行种子数据（可选）
```bash
npm run db:seed
```

这将创建默认管理员用户：
- 邮箱：`admin@example.com`
- 密码：`admin123`

⚠️ **生产环境请立即修改密码！**

### 6. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 7. 访问管理后台
1. 访问 http://localhost:3000/admin/login
2. 使用管理员账号登录
3. 开始管理博客

## 📦 部署步骤

### 部署到 Vercel（推荐）

#### 1. 准备工作
- 推送代码到 GitHub
- 在 Vercel 创建项目并导入仓库

#### 2. 配置环境变量
在 Vercel Dashboard 添加以下环境变量：

```
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-postgres-url?pgbouncer=true
POSTGRES_URL_NON_POOLING=your-postgres-url
POSTGRES_USER=your-user
POSTGRES_HOST=your-host
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=your-database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=欢迎来到2037
NEXT_PUBLIC_SITE_DESCRIPTION=这是一个关于未来科技和思考的博客
NEXT_PUBLIC_AUTHOR=Asta333
```

#### 3. 连接 Vercel Postgres
1. 在 Vercel Dashboard 进入项目设置
2. 选择 Storage → Create Database → Postgres
3. 选择区域并创建
4. Vercel 会自动配置环境变量

#### 4. 初始化数据库
在 Vercel Dashboard 的 Postgres 页面，执行 `sql/init.sql` 中的 SQL。

#### 5. 运行种子数据（可选）
在 Vercel Dashboard 的 Postgres 页面，执行：

```typescript
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash('admin123', 10);
await sql`INSERT INTO users (email, name, password_hash, role) VALUES ('admin@example.com', 'Admin', ${hashedPassword}, 'admin')`;
```

#### 6. 部署
Vercel 会自动部署，部署完成后访问你的域名。

### 部署到其他平台

#### 1. 构建项目
```bash
npm run build
```

#### 2. 配置数据库
确保数据库支持 PostgreSQL，并配置环境变量。

#### 3. 启动服务
```bash
npm start
```

## 🔄 从 Hexo 迁移

### 1. 准备 Hexo 博客
确保 Hexo 博客在 `../my-blog` 目录（或其他相对路径）。

### 2. 迁移数据
1. 登录管理后台
2. 进入"数据迁移"标签
3. 填写 Hexo 博客路径和管理员邮箱
4. 点击"开始迁移"

### 3. 迁移图片
手动将 Hexo 博客的图片复制到 `public/images/` 目录：

```bash
cp -r ../my-blog/source/images/博客文章图片/* public/images/
```

### 4. 验证迁移
检查文章、分类、标签是否正确迁移。

## 📝 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

### Git 提交规范
使用 Conventional Commits 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具链更新
```

### 组件开发规范
- 使用函数组件 + Hooks
- 组件文件放在 `components/` 目录
- 页面文件放在 `app/` 目录
- 工具函数放在 `lib/` 目录
- 类型定义放在 `types/` 目录

### API 开发规范
- 使用 App Router 的 Route Handlers
- 统一错误处理
- 使用 Zod 进行数据验证
- 需要认证的接口检查 session
- 返回 JSON 格式数据

### 数据库操作规范
- 所有数据库操作放在 `lib/db.ts`
- 使用参数化查询防止 SQL 注入
- 使用事务处理复杂操作
- 适当使用索引优化查询

### ISR 使用规范
- 静态页面使用 `generateStaticParams` 预生成
- 动态页面使用 `revalidate` 配置缓存时间
- 数据更新时调用 `revalidatePath` 重新验证

### 安全规范
- 密码使用 bcrypt 加密
- 敏感信息使用环境变量
- API 接口进行权限验证
- 防止 XSS 攻击（使用 `dangerouslySetInnerHTML` 时注意）
- 防止 CSRF 攻击（NextAuth 自动处理）

### 性能优化规范
- 使用 Next.js Image 组件优化图片
- 使用动态导入减少初始加载
- 使用 ISR 减少数据库查询
- 使用缓存减少重复计算
- 优化数据库查询（索引、分页）

## 🧪 测试

### 运行测试
```bash
npm test
```

### 测试覆盖率
```bash
npm run test:coverage
```

## 📚 常见问题

### Q: 如何修改管理员密码？
A: 登录管理后台，在数据库中更新用户密码：

```sql
UPDATE users SET password_hash = '$2a$10$...' WHERE email = 'admin@example.com';
```

### Q: 如何自定义主题？
A: 修改 `tailwind.config.ts` 和组件样式。

### Q: 如何添加新的 API 接口？
A: 在 `app/api/` 目录创建新的 Route Handler。

### Q: 如何配置 CDN？
A: 修改 `next.config.ts` 中的 `images.remotePatterns`。

### Q: 如何备份数据库？
A: 使用 Vercel Postgres 的备份功能或手动导出。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- 作者：Asta333
- 邮箱：admin@example.com
- 博客：https://unicorn777-bot.github.io

---

**注意**: 本项目为示例项目，生产环境使用前请务必：
1. 修改默认管理员密码
2. 配置强密码的 NEXTAUTH_SECRET
3. 启用 HTTPS
4. 配置数据库备份
5. 设置适当的 CORS 策略
6. 定期更新依赖