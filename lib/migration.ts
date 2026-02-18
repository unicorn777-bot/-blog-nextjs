import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createPost, createCategory, createTag, setPostCategories, setPostTags, getUserByEmail } from './db';
import { generateSlug, extractExcerpt } from './markdown';

interface HexoPostData {
  title: string;
  date: string;
  tags?: string[];
  categories?: string[];
  cover?: string;
  author?: string;
}

export async function migrateFromHexo(hexoPath: string, authorEmail: string) {
  const postsPath = path.join(hexoPath, 'source', '_posts');
  // const imagesPath = path.join(hexoPath, 'source', 'images', '博客文章图片');

  // 获取作者
  const author = await getUserByEmail(authorEmail);
  if (!author) {
    throw new Error('Author not found');
  }

  // 读取所有 Markdown 文件
  const files = fs.readdirSync(postsPath).filter(file => file.endsWith('.md'));

  const results = {
    posts: [] as string[],
    errors: [] as string[],
  };

  for (const file of files) {
    try {
      const filePath = path.join(postsPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      const frontMatter = data as HexoPostData;

      // 处理图片路径
      let processedContent = content;
      if (frontMatter.cover) {
        // 将图片路径转换为相对路径
        const coverPath = frontMatter.cover.replace(/^\//, '');
        processedContent = `![${frontMatter.title}](${coverPath})\n\n` + processedContent;
      }

      // 处理内容中的图片路径
      processedContent = processedContent.replace(
        /!\[([^\]]*)\]\(\/images\/博客文章图片\/([^)]+)\)/g,
        (match, alt, filename) => {
          return `![${alt}](/images/${filename})`;
        }
      );

      // 创建文章
      const slug = generateSlug(frontMatter.title);
      const excerpt = extractExcerpt(content, 200);

      const post = await createPost({
        title: frontMatter.title,
        slug,
        content: processedContent,
        excerpt,
        cover_image: frontMatter.cover || null,
        status: 'published',
        author_id: author.id,
        published_at: new Date(frontMatter.date),
      });

      // 处理分类
      if (frontMatter.categories && frontMatter.categories.length > 0) {
        const categoryIds: string[] = [];
        for (const categoryName of frontMatter.categories) {
          const categorySlug = generateSlug(categoryName);
          let category = await getCategoryBySlug(categorySlug);

          if (!category) {
            category = await createCategory({
              name: categoryName,
              slug: categorySlug,
              description: null,
            });
          }
          categoryIds.push(category.id);
        }
        await setPostCategories(post.id, categoryIds);
      }

      // 处理标签
      if (frontMatter.tags && frontMatter.tags.length > 0) {
        const tagIds: string[] = [];
        for (const tagName of frontMatter.tags) {
          const tagSlug = generateSlug(tagName);
          let tag = await getTagBySlug(tagSlug);

          if (!tag) {
            tag = await createTag({
              name: tagName,
              slug: tagSlug,
            });
          }
          tagIds.push(tag.id);
        }
        await setPostTags(post.id, tagIds);
      }

      results.posts.push(post.title);
      console.log(`✓ Migrated: ${post.title}`);
    } catch (error) {
      results.errors.push(`${file}: ${error}`);
      console.error(`✗ Failed to migrate ${file}:`, error);
    }
  }

  return results;
}

// 辅助函数
async function getCategoryBySlug(slug: string) {
  const { sql } = await import('@vercel/postgres');
  const result = await sql`SELECT * FROM categories WHERE slug = ${slug}`;
  return result.rows[0] || null;
}

async function getTagBySlug(slug: string) {
  const { sql } = await import('@vercel/postgres');
  const result = await sql`SELECT * FROM tags WHERE slug = ${slug}`;
  return result.rows[0] || null;
}

// 使用示例
// 在 Node.js 环境中运行：
// import { migrateFromHexo } from './lib/migration';
// await migrateFromHexo('../my-blog', 'admin@example.com');
