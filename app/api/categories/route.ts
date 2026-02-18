import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSlug } from '@/lib/markdown';
import { z } from 'zod';

// 获取分类列表
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: '获取分类列表失败' },
      { status: 500 }
    );
  }
}

// 创建分类（需要认证）
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
      name: z.string().min(1, '分类名称不能为空'),
      description: z.string().nullable().optional(),
    });

    const validatedData = schema.parse(body);

    // 生成 slug
    const slug = generateSlug(validatedData.name);

    // 创建分类
    const category = await createCategory({
      name: validatedData.name,
      slug,
      description: validatedData.description || null,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    );
  }
}