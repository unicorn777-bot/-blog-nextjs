import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('开始初始化数据库...');

  try {
    // 创建默认管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES ('admin@example.com', 'Admin', ${hashedPassword}, 'admin')
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('✓ 默认管理员用户已创建');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: admin123');
    console.log('  ⚠️  请在生产环境中立即修改密码！');

    // 创建示例分类
    await sql`
      INSERT INTO categories (name, slug, description)
      VALUES
        ('博客相关', 'blog-related', '关于博客本身的文章'),
        ('技术分享', 'tech-sharing', '技术相关的分享和教程'),
        ('生活随笔', 'life-notes', '生活中的随笔和感悟')
      ON CONFLICT (slug) DO NOTHING
    `;

    console.log('✓ 示例分类已创建');

    // 创建示例标签
    await sql`
      INSERT INTO tags (name, slug)
      VALUES
        ('Next.js', 'nextjs'),
        ('React', 'react'),
        ('TypeScript', 'typescript'),
        ('数据库', 'database'),
        ('学习笔记', 'learning-notes')
      ON CONFLICT (slug) DO NOTHING
    `;

    console.log('✓ 示例标签已创建');

    console.log('\n数据库初始化完成！');
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

seed();