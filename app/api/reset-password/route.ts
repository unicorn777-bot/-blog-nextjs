import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

// 重置管理员密码
// 注意：生产环境中应该删除此 API 或添加额外验证
export async function GET() {
  try {
    const connectionString = 
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NO_SSL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;
      
    if (!connectionString) {
      return NextResponse.json({ error: '数据库连接字符串未配置' }, { status: 500 });
    }

    const sql = neon(connectionString);

    // 生成新的密码哈希
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 更新管理员密码
    const result = await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE email = 'admin@example.com'
      RETURNING id, email, name, role
    `;

    if (result.length === 0) {
      return NextResponse.json({ 
        error: '用户不存在',
        hint: '请先访问 /api/init 创建管理员用户'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: '密码重置成功',
      user: result[0],
      credentials: {
        email: 'admin@example.com',
        password: 'admin123'
      },
      warning: '请立即登录并修改默认密码！'
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    return NextResponse.json({ 
      error: '重置密码失败', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}
