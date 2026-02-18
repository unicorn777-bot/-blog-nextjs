/**
 * 安全的管理员初始化脚本
 * 使用方法：
 *   交互式：npx tsx --env-file=.env.local scripts/create-admin.ts
 *   非交互式：npx tsx --env-file=.env.local scripts/create-admin.ts --email=admin@example.com --name=Admin --password=YourPassword123!
 * 
 * 此脚本用于创建第一个管理员账户
 * 生产环境应通过命令行运行，而非通过 API
 */

import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import * as readline from 'readline';

// 密码强度验证
function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 12) {
    return { valid: false, message: '密码长度至少12位' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }
  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, message: '密码必须包含特殊字符 (@$!%*?&)' };
  }
  return { valid: true, message: '密码强度符合要求' };
}

// 邮箱验证
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : '';
      if (value) {
        params[key] = value;
        i++;
      }
    }
  }
  
  return params;
}

async function createAdmin() {
  console.log('\n========================================');
  console.log('  博客管理系统 - 管理员账户创建工具');
  console.log('========================================\n');

  // 解析命令行参数
  const cmdArgs = parseArgs();
  
  // 如果提供了命令行参数，使用非交互模式
  if (cmdArgs.email && cmdArgs.name && cmdArgs.password) {
    console.log('使用命令行参数创建管理员账户...\n');
    
    const email = cmdArgs.email;
    const name = cmdArgs.name;
    const password = cmdArgs.password;
    const role = cmdArgs.role || 'admin';

    // 验证邮箱
    if (!validateEmail(email)) {
      console.error('❌ 邮箱格式不正确');
      process.exit(1);
    }

    // 验证密码
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.error(`❌ ${passwordValidation.message}`);
      process.exit(1);
    }

    // 创建账户
    await createAdminAccount(email, name, password, role);
    return;
  }

  // 交互模式
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    // 获取数据库连接
    const connectionString = 
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NO_SSL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;

    if (!connectionString) {
      console.error('❌ 错误：未配置数据库连接字符串');
      console.error('请确保设置了 DATABASE_URL 或 POSTGRES_URL 环境变量');
      console.error('\n使用方法：npx tsx --env-file=.env.local scripts/create-admin.ts');
      process.exit(1);
    }

    const sql = neon(connectionString);

    // 输入邮箱
    const email = await question('请输入管理员邮箱: ');
    if (!validateEmail(email)) {
      console.error('❌ 邮箱格式不正确');
      process.exit(1);
    }

    // 检查邮箱是否已存在
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      console.error('❌ 该邮箱已被注册');
      process.exit(1);
    }

    // 输入姓名
    const name = await question('请输入管理员姓名: ');
    if (!name || name.trim().length === 0) {
      console.error('❌ 姓名不能为空');
      process.exit(1);
    }

    // 输入密码
    console.log('\n密码要求：');
    console.log('  - 至少12位字符');
    console.log('  - 包含大写和小写字母');
    console.log('  - 包含数字');
    console.log('  - 包含特殊字符 (@$!%*?&)\n');
    
    const password = await question('请输入密码: ');
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.error(`❌ ${passwordValidation.message}`);
      process.exit(1);
    }

    // 确认密码
    const confirmPassword = await question('请再次输入密码确认: ');
    if (password !== confirmPassword) {
      console.error('❌ 两次输入的密码不一致');
      process.exit(1);
    }

    // 选择角色
    console.log('\n可选角色：');
    console.log('  1. admin (管理员 - 完全权限)');
    console.log('  2. editor (编辑 - 可管理内容)');
    const roleChoice = await question('请选择角色 (1/2, 默认为admin): ');
    const role = roleChoice === '2' ? 'editor' : 'admin';

    // 确认创建
    console.log('\n----------------------------------------');
    console.log('即将创建管理员账户：');
    console.log(`  邮箱: ${email.toLowerCase()}`);
    console.log(`  姓名: ${name.trim()}`);
    console.log(`  角色: ${role}`);
    console.log('----------------------------------------\n');

    const confirm = await question('确认创建？(y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('已取消创建');
      process.exit(0);
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (${email.toLowerCase()}, ${name.trim()}, ${hashedPassword}, ${role})
      RETURNING id, email, name, role
    `;

    console.log('\n✅ 管理员账户创建成功！');
    console.log(`   ID: ${result[0].id}`);
    console.log(`   邮箱: ${result[0].email}`);
    console.log(`   角色: ${result[0].role}`);
    console.log('\n请妥善保管您的登录凭据，现在可以通过 /admin-8ca5e53f792989e9/login 登录管理后台。\n');

  } catch (error) {
    console.error('❌ 创建失败:', (error as Error).message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function createAdminAccount(email: string, name: string, password: string, role: string) {
  try {
    const connectionString = 
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NO_SSL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;

    if (!connectionString) {
      console.error('❌ 错误：未配置数据库连接字符串');
      process.exit(1);
    }

    const sql = neon(connectionString);

    // 检查邮箱是否已存在
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      console.error('❌ 该邮箱已被注册');
      process.exit(1);
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (${email.toLowerCase()}, ${name.trim()}, ${hashedPassword}, ${role})
      RETURNING id, email, name, role
    `;

    console.log('✅ 管理员账户创建成功！');
    console.log(`   ID: ${result[0].id}`);
    console.log(`   邮箱: ${result[0].email}`);
    console.log(`   角色: ${result[0].role}`);
    console.log('\n后台地址: /admin-8ca5e53f792989e9/login\n');

  } catch (error) {
    console.error('❌ 创建失败:', (error as Error).message);
    process.exit(1);
  }
}

createAdmin();