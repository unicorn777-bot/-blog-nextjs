import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByPostId, createComment } from '@/lib/db';
import { z } from 'zod';
import { sanitizeComment, sanitizeUrl, commentRateLimiter } from '@/lib/security';

// 获取文章评论
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { error: '缺少post_id参数' },
        { status: 400 }
      );
    }

    const comments = await getCommentsByPostId(postId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// 创建评论（游客可访问）
export async function POST(request: NextRequest) {
  try {
    // 速率限制
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const rateLimit = commentRateLimiter.check(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '评论过于频繁，请稍后再试' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    const body = await request.json();

    const schema = z.object({
      post_id: z.string().uuid('文章ID格式错误'),
      parent_id: z.string().uuid().optional(),
      author_name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50字'),
      author_email: z.string().email('邮箱格式错误').optional().or(z.literal('')),
      author_url: z.string().url('网址格式错误').optional().or(z.literal('')),
      content: z.string().min(1, '评论内容不能为空').max(2000, '评论内容不能超过2000字'),
    });

    const validatedData = schema.parse(body);

    // 安全过滤：清理用户输入
    const sanitizedName = sanitizeComment(validatedData.author_name);
    const sanitizedEmail = validatedData.author_email ? sanitizeComment(validatedData.author_email) : null;
    const sanitizedUrl = validatedData.author_url ? sanitizeUrl(validatedData.author_url) : null;
    const sanitizedContent = sanitizeComment(validatedData.content);

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent') || '';

    const comment = await createComment({
      post_id: validatedData.post_id,
      parent_id: validatedData.parent_id,
      author_name: sanitizedName,
      author_email: sanitizedEmail || undefined,
      author_url: sanitizedUrl || undefined,
      content: sanitizedContent,
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json({
      message: '评论已提交，等待审核',
      comment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '提交评论失败' },
      { status: 500 }
    );
  }
}
