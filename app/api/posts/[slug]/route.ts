import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, updatePost, deletePost, incrementPostViewCount } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSlug, extractExcerpt } from '@/lib/markdown';
import { z } from 'zod';

interface UpdateData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  cover_image?: string | null;
  status?: 'draft' | 'published' | 'archived';
  published_at?: Date;
}

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    // 增加阅读量
    await incrementPostViewCount(post.id);

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}

// 更新文章（需要认证）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // 验证输入
    const schema = z.object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      excerpt: z.string().optional(),
      cover_image: z.string().nullable().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    });

    const validatedData = schema.parse(body);

    // 如果标题改变，更新 slug
    const updateData: UpdateData = { ...validatedData };
    if (validatedData.title && validatedData.title !== post.title) {
      updateData.slug = generateSlug(validatedData.title);
    }

    // 如果没有提供摘要，从内容生成
    if (validatedData.content && !validatedData.excerpt) {
      updateData.excerpt = extractExcerpt(validatedData.content);
    }

    // 如果状态从草稿变为发布，设置发布时间
    if (validatedData.status === 'published' && post.status !== 'published') {
      updateData.published_at = new Date();
    }

    // 更新文章
    const updatedPost = await updatePost(post.id, updateData);

    // 更新分类和标签
    if (validatedData.categories !== undefined) {
      const { setPostCategories } = await import('@/lib/db');
      await setPostCategories(post.id, validatedData.categories);
    }

    if (validatedData.tags !== undefined) {
      const { setPostTags } = await import('@/lib/db');
      await setPostTags(post.id, validatedData.tags);
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// 删除文章（需要认证）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    await deletePost(post.id);

    return NextResponse.json({ message: '文章已删除' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
}
