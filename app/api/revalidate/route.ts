import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// ISR Revalidate API - 用于在后台更新内容后触发页面重新生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, tag, secret } = body;

    // 验证密钥（防止未授权调用）
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: '无效的密钥' },
        { status: 401 }
      );
    }

    // 重新验证指定路径
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ 
        revalidated: true, 
        message: `路径 ${path} 已重新验证` 
      });
    }

    // 重新验证指定标签
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ 
        revalidated: true, 
        message: `标签 ${tag} 已重新验证` 
      });
    }

    // 重新验证所有主要页面
    revalidatePath('/', 'layout');
    revalidatePath('/categories', 'layout');
    revalidatePath('/tags', 'layout');
    
    return NextResponse.json({ 
      revalidated: true, 
      message: '所有页面已重新验证' 
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: '重新验证失败' },
      { status: 500 }
    );
  }
}
