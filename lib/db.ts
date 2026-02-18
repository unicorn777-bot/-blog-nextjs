import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { unstable_noStore as noStore } from 'next/cache';

// 创建数据库连接 - Neon 返回的是一个模板字符串标签函数
const getSql = (): NeonQueryFunction<false, false> => {
  const connectionString = 
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NO_SSL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;
    
  if (!connectionString) {
    throw new Error('数据库连接字符串未配置');
  }
  return neon(connectionString);
};

// 缓存 SQL 实例
let sqlInstance: NeonQueryFunction<false, false> | null = null;

// 获取 SQL 实例
const getSqlInstance = (): NeonQueryFunction<false, false> => {
  if (!sqlInstance) {
    sqlInstance = getSql();
  }
  return sqlInstance;
};

// SQL 查询结果接口
interface SqlResult<T> {
  rows: T[];
}

// 创建兼容的 SQL 接口
const sql = Object.assign(
  // 模板字符串调用: sql`SELECT * FROM table`
  // 返回 { rows: T[] } 格式以兼容代码中的使用方式
  async <T = unknown>(strings: TemplateStringsArray, ...values: (string | number | boolean | Date | null | undefined)[]): Promise<SqlResult<T>> => {
    const instance = getSqlInstance();
    const result = await instance(strings, ...values);
    return { rows: result as T[] };
  },
  {
    // 普通查询调用: sql.query("SELECT * FROM table WHERE id = $1", [id])
    // 使用 Neon 原生的 query 方法
    query: async <T = unknown>(queryString: string, params: (string | number | boolean | null)[] = []): Promise<SqlResult<T>> => {
      const instance = getSqlInstance();
      const result = await instance.query(queryString, params);
      return { rows: result as T[] };
    },
    // unsafe 方法 - 用于模板字符串中的原始 SQL 片段
    unsafe: (rawSQL: string) => getSqlInstance().unsafe(rawSQL)
  }
);

// 用户表
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: Date;
  updated_at: Date;
}

// 文章表
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  categories?: Category[];
  tags?: Tag[];
}

// 分类表
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
}

// 标签表
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
}

// 文章分类关联表
export interface PostCategory {
  post_id: string;
  category_id: string;
}

// 文章标签关联表
export interface PostTag {
  post_id: string;
  tag_id: string;
}

// 用户相关操作
export async function getUserByEmail(email: string): Promise<User | null> {
  noStore();
  const result = await sql<User>`SELECT * FROM users WHERE email = ${email}`;
  return result.rows[0] || null;
}

export async function getUserById(id: string): Promise<User | null> {
  noStore();
  const result = await sql<User>`SELECT * FROM users WHERE id = ${id}`;
  return result.rows[0] || null;
}

export async function createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const result = await sql<User>`
    INSERT INTO users (email, name, password_hash, role)
    VALUES (${data.email}, ${data.name}, ${data.password_hash}, ${data.role})
    RETURNING *
  `;
  return result.rows[0];
}

// 文章相关操作
export async function getPosts({
  limit = 10,
  offset = 0,
  status = 'published',
  categorySlug,
  tagSlug,
}: {
  limit?: number;
  offset?: number;
  status?: 'draft' | 'published' | 'archived' | 'all';
  categorySlug?: string;
  tagSlug?: string;
} = {}): Promise<{ posts: Post[]; total: number }> {
  noStore();

  // 构建基础查询
  const whereConditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (status !== 'all') {
    whereConditions.push(`p.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (categorySlug) {
    whereConditions.push(`c.slug = $${paramIndex}`);
    params.push(categorySlug);
    paramIndex++;
  }

  if (tagSlug) {
    whereConditions.push(`t.slug = $${paramIndex}`);
    params.push(tagSlug);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';

  // 主查询
  const query = `
    SELECT DISTINCT p.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  // 计数查询
  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    ${whereClause}
  `;

  const [postsResult, countResult] = await Promise.all([
    sql.query<Post>(query, params),
    sql.query<{ total: string }>(countQuery, params.slice(0, -2)),
  ]);

  return {
    posts: postsResult.rows,
    total: parseInt(countResult.rows[0]?.total || '0'),
  };
}

export async function getPostBySlug(slug: string): Promise<(Post & { categories: Category[]; tags: Tag[] }) | null> {
  noStore();

  const result = await sql<
    Post & {
      categories: Category[];
      tags: Tag[];
    }
  >`
    SELECT p.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = ${slug} AND p.status = 'published'
    GROUP BY p.id
  `;

  if (result.rows.length === 0) return null;

  const post = result.rows[0];
  return {
    ...post,
    categories: post.categories || [],
    tags: post.tags || [],
  };
}

export async function getPostById(id: string): Promise<(Post & { categories: Category[]; tags: Tag[] }) | null> {
  noStore();

  const result = await sql<
    Post & {
      categories: Category[];
      tags: Tag[];
    }
  >`
    SELECT p.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ${id}
    GROUP BY p.id
  `;

  if (result.rows.length === 0) return null;

  const post = result.rows[0];
  return {
    ...post,
    categories: post.categories || [],
    tags: post.tags || [],
  };
}

export async function createPost(data: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<Post> {
  const result = await sql<Post>`
    INSERT INTO posts (title, slug, content, excerpt, cover_image, status, author_id, published_at)
    VALUES (${data.title}, ${data.slug}, ${data.content}, ${data.excerpt}, ${data.cover_image}, ${data.status}, ${data.author_id}, ${data.published_at ? data.published_at.toISOString() : null})
    RETURNING *
  `;
  return result.rows[0];
}

export async function updatePost(id: string, data: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'author_id'>>): Promise<Post> {
  const result = await sql<Post>`
    UPDATE posts
    SET title = COALESCE(${data.title}, title),
        slug = COALESCE(${data.slug}, slug),
        content = COALESCE(${data.content}, content),
        excerpt = COALESCE(${data.excerpt}, excerpt),
        cover_image = COALESCE(${data.cover_image}, cover_image),
        status = COALESCE(${data.status}, status),
        published_at = COALESCE(${data.published_at ? data.published_at.toISOString() : null}, published_at),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deletePost(id: string): Promise<void> {
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

export async function incrementPostViewCount(id: string): Promise<void> {
  await sql`UPDATE posts SET view_count = view_count + 1 WHERE id = ${id}`;
}

// 分类相关操作
export async function getCategories(): Promise<Category[]> {
  noStore();
  const result = await sql<Category>`
    SELECT c.*, COUNT(pc.post_id) as post_count
    FROM categories c
    LEFT JOIN post_categories pc ON c.id = pc.category_id
    LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'published'
    GROUP BY c.id
    ORDER BY c.name
  `;
  return result.rows;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  noStore();
  const result = await sql<Category>`SELECT * FROM categories WHERE slug = ${slug}`;
  return result.rows[0] || null;
}

export async function createCategory(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const result = await sql<Category>`
    INSERT INTO categories (name, slug, description)
    VALUES (${data.name}, ${data.slug}, ${data.description})
    RETURNING *
  `;
  return result.rows[0];
}

// 标签相关操作
export async function getTags(): Promise<Tag[]> {
  noStore();
  const result = await sql<Tag>`
    SELECT t.*, COUNT(pt.post_id) as post_count
    FROM tags t
    LEFT JOIN post_tags pt ON t.id = pt.tag_id
    LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
    GROUP BY t.id
    ORDER BY t.name
  `;
  return result.rows;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  noStore();
  const result = await sql<Tag>`SELECT * FROM tags WHERE slug = ${slug}`;
  return result.rows[0] || null;
}

export async function createTag(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
  const result = await sql<Tag>`
    INSERT INTO tags (name, slug)
    VALUES (${data.name}, ${data.slug})
    RETURNING *
  `;
  return result.rows[0];
}

// 文章分类关联操作
export async function setPostCategories(postId: string, categoryIds: string[]): Promise<void> {
  await sql`DELETE FROM post_categories WHERE post_id = ${postId}`;

  for (const categoryId of categoryIds) {
    await sql`INSERT INTO post_categories (post_id, category_id) VALUES (${postId}, ${categoryId})`;
  }
}

// 文章标签关联操作
export async function setPostTags(postId: string, tagIds: string[]): Promise<void> {
  await sql`DELETE FROM post_tags WHERE post_id = ${postId}`;

  for (const tagId of tagIds) {
    await sql`INSERT INTO post_tags (post_id, tag_id) VALUES (${postId}, ${tagId})`;
  }
}

// 评论表
export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  author_url: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  updated_at: Date;
  replies?: Comment[];
}

// 网站配置
export interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: Date;
}

// 评论相关操作
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  noStore();
  const result = await sql<Comment>`
    SELECT * FROM comments 
    WHERE post_id = ${postId} AND status = 'approved'
    ORDER BY created_at DESC
  `;
  
  // 构建评论树
  const comments = result.rows;
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];
  
  // 先创建所有评论的映射
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });
  
  // 构建树形结构
  comments.forEach(comment => {
    const node = commentMap.get(comment.id)!;
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(node);
      }
    } else {
      rootComments.push(node);
    }
  });
  
  return rootComments;
}

export async function getAllComments({
  limit = 20,
  offset = 0,
  status,
}: {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'approved' | 'spam' | 'trash' | 'all';
} = {}): Promise<{ comments: Comment[]; total: number }> {
  noStore();
  
  let query = `
    SELECT c.*, p.title as post_title
    FROM comments c
    LEFT JOIN posts p ON c.post_id = p.id
  `;
  
  const params: (string | number)[] = [];
  let paramIndex = 1;
  
  if (status && status !== 'all') {
    query += ` WHERE c.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  
  query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const countQuery = `SELECT COUNT(*) as total FROM comments${status && status !== 'all' ? ` WHERE status = '${status}'` : ''}`;
  
  const [commentsResult, countResult] = await Promise.all([
    sql.query<Comment>(query, params),
    sql.query<{ total: string }>(countQuery, []),
  ]);
  
  return {
    comments: commentsResult.rows,
    total: parseInt(countResult.rows[0]?.total || '0'),
  };
}

export async function createComment(data: {
  post_id: string;
  parent_id?: string;
  author_name: string;
  author_email?: string;
  author_url?: string;
  content: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<Comment> {
  const result = await sql<Comment>`
    INSERT INTO comments (post_id, parent_id, author_name, author_email, author_url, content, ip_address, user_agent, status)
    VALUES (${data.post_id}, ${data.parent_id || null}, ${data.author_name}, ${data.author_email || null}, ${data.author_url || null}, ${data.content}, ${data.ip_address || null}, ${data.user_agent || null}, 'pending')
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateCommentStatus(id: string, status: 'pending' | 'approved' | 'spam' | 'trash'): Promise<Comment> {
  const result = await sql<Comment>`
    UPDATE comments SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deleteComment(id: string): Promise<void> {
  await sql`DELETE FROM comments WHERE id = ${id}`;
}

// 网站配置相关操作
export async function getSetting(key: string): Promise<string | null> {
  noStore();
  const result = await sql<Setting>`SELECT * FROM settings WHERE key = ${key}`;
  return result.rows[0]?.value || null;
}

export async function getSettings(): Promise<Record<string, string>> {
  noStore();
  const result = await sql<Setting>`SELECT * FROM settings`;
  const settings: Record<string, string> = {};
  result.rows.forEach(row => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
  `;
}

// 获取所有已发布文章的slug列表（用于ISR revalidate）
export async function getAllPostSlugs(): Promise<string[]> {
  noStore();
  const result = await sql<{ slug: string }>`
    SELECT slug FROM posts WHERE status = 'published'
  `;
  return result.rows.map(row => row.slug);
}

// 获取所有分类slug列表
export async function getAllCategorySlugs(): Promise<string[]> {
  noStore();
  const result = await sql<{ slug: string }>`SELECT slug FROM categories`;
  return result.rows.map(row => row.slug);
}

// 获取所有标签slug列表
export async function getAllTagSlugs(): Promise<string[]> {
  noStore();
  const result = await sql<{ slug: string }>`SELECT slug FROM tags`;
  return result.rows.map(row => row.slug);
}
