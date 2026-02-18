import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

// 初始化数据库 - 创建默认管理员用户
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

    // 检查是否已存在管理员
    const existingAdmin = await sql`SELECT * FROM users WHERE email = 'admin@example.com'`;
    
    if (existingAdmin.length > 0) {
      return NextResponse.json({ 
        message: '管理员用户已存在',
        email: 'admin@example.com',
        hint: '如果忘记密码，请直接在数据库中重置'
      });
    }

    // 创建默认管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const result = await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES ('admin@example.com', 'Admin', ${hashedPassword}, 'admin')
      RETURNING id, email, name, role
    `;

    return NextResponse.json({ 
      message: '初始化成功',
      user: result[0],
      credentials: {
        email: 'admin@example.com',
        password: 'admin123'
      },
      warning: '请立即修改默认密码！'
    });
  } catch (error) {
    console.error('初始化失败:', error);
    return NextResponse.json({ 
      error: '初始化失败', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}
