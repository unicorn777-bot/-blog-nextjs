import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSlug, extractExcerpt } from '@/lib/markdown';
import { z } from 'zod';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categorySlug = searchParams.get('category') || undefined;
    const tagSlug = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;

    const offset = (page - 1) * limit;

    const { posts, total } = await getPosts({
      limit,
      offset,
      status: 'published',
      categorySlug,
      tagSlug,
      search,
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// 创建文章（需要认证）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证输入
    const schema = z.object({
      title: z.string().min(1, '标题不能为空'),
      content: z.string().min(1, '内容不能为空'),
      excerpt: z.string().optional(),
      cover_image: z.string().nullable().optional(),
      status: z.enum(['draft', 'published', 'archived']).default('draft'),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    });

    const validatedData = schema.parse(body);

    // 生成 slug 和摘要
    const slug = generateSlug(validatedData.title);
    const excerpt = validatedData.excerpt || extractExcerpt(validatedData.content);

    const sessionUser = session.user as SessionUser;

    // 创建文章
    const post = await createPost({
      title: validatedData.title,
      slug,
      content: validatedData.content,
      excerpt,
      cover_image: validatedData.cover_image || null,
      status: validatedData.status,
      author_id: sessionUser.id,
      published_at: validatedData.status === 'published' ? new Date() : null,
    });

    // 设置分类和标签
    if (validatedData.categories) {
      const { setPostCategories } = await import('@/lib/db');
      await setPostCategories(post.id, validatedData.categories);
    }

    if (validatedData.tags) {
      const { setPostTags } = await import('@/lib/db');
      await setPostTags(post.id, validatedData.tags);
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
}
