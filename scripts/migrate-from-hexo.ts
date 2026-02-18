import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

// Hexo文章的Front-matter接口
interface HexoFrontMatter {
  title: string;
  date: string;
  categories?: string | string[];
  tags?: string | string[];
  cover?: string;
  author?: string;
  excerpt?: string;
}

// 解析Front-matter
function parseFrontMatter(content: string): { frontMatter: HexoFrontMatter; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { frontMatter: { title: '', date: new Date().toISOString() }, body: content };
  }
  
  const frontMatterStr = match[1];
  const body = content.slice(match[0].length).trim();
  
  const frontMatter: HexoFrontMatter = {
    title: '',
    date: new Date().toISOString(),
  };
  
  // 解析YAML格式的front-matter
  const lines = frontMatterStr.split('\n');
  let currentKey = '';
  let isArray = false;
  let arrayValues: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过空行
    if (!trimmedLine) continue;
    
    // 检查是否是数组项
    if (trimmedLine.startsWith('- ')) {
      if (currentKey && isArray) {
        arrayValues.push(trimmedLine.slice(2).trim());
      }
      continue;
    }
    
    // 检查是否是键值对
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      // 保存之前的数组
      if (currentKey && isArray && arrayValues.length > 0) {
        (frontMatter as any)[currentKey] = arrayValues;
        arrayValues = [];
        isArray = false;
      }
      
      const key = trimmedLine.slice(0, colonIndex).trim();
      let value = trimmedLine.slice(colonIndex + 1).trim();
      
      // 检查是否是数组开始
      if (value === '' || value === '[]') {
        currentKey = key;
        isArray = true;
        arrayValues = [];
        if (value === '[]') {
          (frontMatter as any)[key] = [];
          isArray = false;
        }
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // 内联数组格式 [item1, item2]
        const items = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        (frontMatter as any)[key] = items.filter(s => s);
        isArray = false;
      } else {
        // 普通字符串值
        value = value.replace(/^['"]|['"]$/g, '');
        (frontMatter as any)[key] = value;
        isArray = false;
        currentKey = '';
      }
    }
  }
  
  // 保存最后的数组
  if (currentKey && isArray && arrayValues.length > 0) {
    (frontMatter as any)[currentKey] = arrayValues;
  }
  
  return { frontMatter, body };
}

// 生成slug
function generateSlug(title: string): string {
  // 移除特殊字符，转换为小写，空格替换为连字符
  return title
    .toLowerCase()
    .replace(/[^\w\s-\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// 生成UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 生成日期路径（按照Hexo的permalink格式 :year/:month/:day/:title/）
function generateDatePath(dateStr: string, slug: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}/${slug}`;
}

async function migrate() {
  console.log('开始从Hexo迁移数据...\n');
  
  // Hexo文章目录
  const postsDir = path.join(__dirname, '../../my-blog/source/_posts');
  
  // 检查目录是否存在
  if (!fs.existsSync(postsDir)) {
    console.error(`错误: 找不到文章目录 ${postsDir}`);
    process.exit(1);
  }
  
  // 获取所有.md文件
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  console.log(`找到 ${files.length} 篇文章\n`);
  
  // 存储分类和标签
  const categoriesMap = new Map<string, string>();
  const tagsMap = new Map<string, string>();
  
  // 获取默认管理员用户
  let adminUser;
  try {
    const userResult = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    if (userResult.rows.length === 0) {
      console.error('错误: 找不到管理员用户，请先运行 npm run seed 初始化数据库');
      process.exit(1);
    }
    adminUser = userResult.rows[0];
    console.log(`使用管理员用户: ${adminUser.id}\n`);
  } catch (error) {
    console.error('查询用户失败:', error);
    process.exit(1);
  }
  
  // 第一遍：收集所有分类和标签
  console.log('=== 第一遍: 收集分类和标签 ===');
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontMatter } = parseFrontMatter(content);
    
    // 收集分类
    const categories = Array.isArray(frontMatter.categories) 
      ? frontMatter.categories 
      : frontMatter.categories ? [frontMatter.categories] : [];
    
    for (const cat of categories) {
      if (cat && !categoriesMap.has(cat)) {
        const slug = generateSlug(cat);
        categoriesMap.set(cat, slug);
        console.log(`  分类: ${cat} -> ${slug}`);
      }
    }
    
    // 收集标签
    const tags = Array.isArray(frontMatter.tags) 
      ? frontMatter.tags 
      : frontMatter.tags ? [frontMatter.tags] : [];
    
    for (const tag of tags) {
      if (tag && !tagsMap.has(tag)) {
        const slug = generateSlug(tag);
        tagsMap.set(tag, slug);
        console.log(`  标签: ${tag} -> ${slug}`);
      }
    }
  }
  
  // 插入分类到数据库
  console.log('\n=== 插入分类到数据库 ===');
  const categoryIdMap = new Map<string, string>();
  for (const [name, slug] of categoriesMap) {
    const id = generateUUID();
    try {
      await sql`
        INSERT INTO categories (id, name, slug, description)
        VALUES (${id}, ${name}, ${slug}, null)
        ON CONFLICT (slug) DO UPDATE SET name = ${name}
      `;
      categoryIdMap.set(name, id);
      console.log(`  ✓ 分类已创建: ${name}`);
    } catch (error) {
      // 如果插入失败，尝试获取现有ID
      const existing = await sql`SELECT id FROM categories WHERE slug = ${slug}`;
      if (existing.rows.length > 0) {
        categoryIdMap.set(name, existing.rows[0].id);
        console.log(`  ✓ 分类已存在: ${name}`);
      }
    }
  }
  
  // 插入标签到数据库
  console.log('\n=== 插入标签到数据库 ===');
  const tagIdMap = new Map<string, string>();
  for (const [name, slug] of tagsMap) {
    const id = generateUUID();
    try {
      await sql`
        INSERT INTO tags (id, name, slug)
        VALUES (${id}, ${name}, ${slug})
        ON CONFLICT (slug) DO UPDATE SET name = ${name}
      `;
      tagIdMap.set(name, id);
      console.log(`  ✓ 标签已创建: ${name}`);
    } catch (error) {
      // 如果插入失败，尝试获取现有ID
      const existing = await sql`SELECT id FROM tags WHERE slug = ${slug}`;
      if (existing.rows.length > 0) {
        tagIdMap.set(name, existing.rows[0].id);
        console.log(`  ✓ 标签已存在: ${name}`);
      }
    }
  }
  
  // 第二遍：插入文章
  console.log('\n=== 插入文章到数据库 ===');
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontMatter, body } = parseFrontMatter(content);
    
    const title = frontMatter.title || path.basename(file, '.md');
    const slug = generateSlug(title);
    const dateStr = frontMatter.date || new Date().toISOString();
    const publishedAt = new Date(dateStr);
    
    // 生成摘要（取前200个字符）
    const excerpt = body.replace(/[#*`\[\]]/g, '').slice(0, 200).trim() + '...';
    
    // 处理封面图片路径
    let coverImage = frontMatter.cover || null;
    if (coverImage) {
      // 保持原有路径格式
      coverImage = coverImage.replace(/^\/images\//, '/images/');
    }
    
    const postId = generateUUID();
    
    try {
      // 插入文章
      await sql`
        INSERT INTO posts (id, title, slug, content, excerpt, cover_image, status, author_id, published_at, created_at, updated_at)
        VALUES (${postId}, ${title}, ${slug}, ${body}, ${excerpt}, ${coverImage}, 'published', ${adminUser.id}, ${publishedAt.toISOString()}, ${publishedAt.toISOString()}, ${publishedAt.toISOString()})
        ON CONFLICT (slug) DO UPDATE SET 
          title = ${title},
          content = ${body},
          excerpt = ${excerpt},
          cover_image = ${coverImage},
          updated_at = NOW()
      `;
      console.log(`  ✓ 文章已创建: ${title}`);
      
      // 关联分类
      const categories = Array.isArray(frontMatter.categories) 
        ? frontMatter.categories 
        : frontMatter.categories ? [frontMatter.categories] : [];
      
      for (const cat of categories) {
        const catId = categoryIdMap.get(cat);
        if (catId) {
          await sql`
            INSERT INTO post_categories (post_id, category_id)
            VALUES (${postId}, ${catId})
            ON CONFLICT DO NOTHING
          `;
        }
      }
      
      // 关联标签
      const tags = Array.isArray(frontMatter.tags) 
        ? frontMatter.tags 
        : frontMatter.tags ? [frontMatter.tags] : [];
      
      for (const tag of tags) {
        const tagId = tagIdMap.get(tag);
        if (tagId) {
          await sql`
            INSERT INTO post_tags (post_id, tag_id)
            VALUES (${postId}, ${tagId})
            ON CONFLICT DO NOTHING
          `;
        }
      }
      
    } catch (error) {
      console.error(`  ✗ 文章插入失败: ${title}`, error);
    }
  }
  
  console.log('\n=== 迁移完成 ===');
  console.log(`分类数: ${categoriesMap.size}`);
  console.log(`标签数: ${tagsMap.size}`);
  console.log(`文章数: ${files.length}`);
}

migrate().catch(console.error);
