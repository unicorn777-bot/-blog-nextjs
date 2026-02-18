import { NextAuthOptions, DefaultSession, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByEmail } from './db';
import bcrypt from 'bcryptjs';

// 扩展 User 类型
interface ExtendedUser extends User {
  role: string;
}

// 扩展 next-auth 类型
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

// 登录失败计数器（内存存储，生产环境应使用 Redis）
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15分钟锁定

// 记录登录失败尝试
function recordFailedAttempt(email: string): void {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(email, attempts);
  
  // 添加延迟防止暴力破解
  const delay = Math.min(1000 * Math.pow(2, attempts.count - 1), 10000);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('邮箱和密码不能为空');
        }

        const email = credentials.email.toLowerCase();
        
        // 检查是否被锁定
        const attempts = loginAttempts.get(email);
        if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
          const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
          if (timeSinceLastAttempt < LOCKOUT_DURATION) {
            const remainingMinutes = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000);
            throw new Error(`登录失败次数过多，请${remainingMinutes}分钟后再试`);
          } else {
            // 锁定期已过，重置计数
            loginAttempts.delete(email);
          }
        }

        const user = await getUserByEmail(email);

        if (!user) {
          // 记录失败尝试（防止用户枚举攻击，统一返回错误信息）
          recordFailedAttempt(email);
          throw new Error('邮箱或密码错误');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          recordFailedAttempt(email);
          throw new Error('邮箱或密码错误');
        }

        // 登录成功，清除失败记录
        loginAttempts.delete(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as ExtendedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.role = extendedUser.role;
        token.iat = Math.floor(Date.now() / 1000); // 登录时间
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin-8ca5e53f792989e9/login',
    error: '/admin-8ca5e53f792989e9/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24小时过期
    updateAge: 60 * 60, // 每小时更新一次
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60,
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};