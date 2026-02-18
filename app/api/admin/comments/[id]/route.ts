import { NextRequest, NextResponse } from 'next/server';
import { updateCommentStatus, deleteComment } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 更新评论状态（需要认证）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status: 'pending' | 'approved' | 'spam' | 'trash' };

    if (!status) {
      return NextResponse.json(
        { error: '缺少status参数' },
        { status: 400 }
      );
    }

    const comment = await updateCommentStatus(id, status);
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: '更新评论状态失败' },
      { status: 500 }
    );
  }
}

// 删除评论（需要认证）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteComment(id);

    return NextResponse.json({ message: '评论已删除' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: '删除评论失败' },
      { status: 500 }
    );
  }
}
