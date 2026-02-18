import { NextRequest, NextResponse } from 'next/server';
import { getTags, createTag } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSlug } from '@/lib/markdown';
import { z } from 'zod';

// 获取标签列表
export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: '获取标签列表失败' },
      { status: 500 }
    );
  }
}

// 创建标签（需要认证）
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
      name: z.string().min(1, '标签名称不能为空'),
    });

    const validatedData = schema.parse(body);

    // 生成 slug
    const slug = generateSlug(validatedData.name);

    // 创建标签
    const tag = await createTag({
      name: validatedData.name,
      slug,
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    );
  }
}