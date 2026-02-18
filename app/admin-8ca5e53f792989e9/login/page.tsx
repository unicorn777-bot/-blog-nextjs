'use client';

import { useState, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 简单的数学验证码
function generateCaptcha(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return {
    question: `${a} + ${b} = ?`,
    answer: a + b,
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaData, setCaptchaData] = useState(generateCaptcha());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // 检查锁定状态
  useEffect(() => {
    const lockoutEnd = localStorage.getItem('admin_lockout_end');
    if (lockoutEnd) {
      const remaining = parseInt(lockoutEnd) - Date.now();
      if (remaining > 0) {
        setLockoutTime(Math.ceil(remaining / 1000));
      } else {
        localStorage.removeItem('admin_lockout_end');
      }
    }
  }, []);

  // 倒计时
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(lockoutTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  const refreshCaptcha = useCallback(() => {
    setCaptchaData(generateCaptcha());
    setCaptcha('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 检查锁定状态
    if (lockoutTime > 0) {
      setError(`账户已锁定，请 ${lockoutTime} 秒后重试`);
      return;
    }

    // 验证码检查
    if (parseInt(captcha) !== captchaData.answer) {
      setError('验证码错误');
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // 检查是否是锁定错误
        const lockoutMatch = result.error.match(/(\d+)\s*分钟/);
        if (lockoutMatch) {
          const minutes = parseInt(lockoutMatch[1]);
          const lockoutEnd = Date.now() + minutes * 60 * 1000;
          localStorage.setItem('admin_lockout_end', lockoutEnd.toString());
          setLockoutTime(minutes * 60);
          setError(`登录失败次数过多，已锁定 ${minutes} 分钟`);
        } else {
          setError('邮箱或密码错误');
          // 记录失败次数
          const attempts = parseInt(localStorage.getItem('admin_login_attempts') || '0') + 1;
          localStorage.setItem('admin_login_attempts', attempts.toString());
          if (attempts >= 3) {
            refreshCaptcha();
          }
        }
        refreshCaptcha();
      } else {
        // 登录成功，清除记录
        localStorage.removeItem('admin_login_attempts');
        localStorage.removeItem('admin_lockout_end');
        router.push('/admin-8ca5e53f792989e9');
        router.refresh();
      }
    } catch {
      setError('登录失败，请重试');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              管理后台
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {process.env.NEXT_PUBLIC_SITE_NAME || '欢迎来到2037'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={lockoutTime > 0}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={lockoutTime > 0}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                验证码：{captchaData.question}
              </label>
              <div className="flex gap-2">
                <input
                  id="captcha"
                  type="number"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  required
                  disabled={lockoutTime > 0}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
                  placeholder="请输入答案"
                />
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                  title="刷新验证码"
                >
                  刷新
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {lockoutTime > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg">
                账户已锁定，剩余时间：{Math.floor(lockoutTime / 60)}分{lockoutTime % 60}秒
              </div>
            )}

            <button
              type="submit"
              disabled={loading || lockoutTime > 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : lockoutTime > 0 ? '已锁定' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              返回首页
            </Link>
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>连续登录失败5次将被锁定15分钟</p>
        </div>
      </div>
    </div>
  );
}
