import { NextRequest, NextResponse } from 'next/server';
import { migrateFromHexo } from '@/lib/migration';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// 从 Hexo 迁移数据（需要认证）
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
      hexoPath: z.string().min(1, 'Hexo 路径不能为空'),
      authorEmail: z.string().email('邮箱格式不正确'),
    });

    const validatedData = schema.parse(body);

    // 执行迁移
    const results = await migrateFromHexo(validatedData.hexoPath, validatedData.authorEmail);

    return NextResponse.json({
      message: '迁移完成',
      results,
    });
  } catch (error) {
    console.error('Error migrating from Hexo:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '迁移失败', message: (error as Error).message },
      { status: 500 }
    );
  }
}