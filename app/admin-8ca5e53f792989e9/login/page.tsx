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
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%)',
            left: '10%',
            top: '20%',
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
            right: '10%',
            bottom: '20%',
          }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-8">
          {/* Logo 和标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-blue)] flex items-center justify-center">
              <span className="text-[var(--bg-primary)] font-bold text-2xl">2</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              管理后台
            </h1>
            <p className="text-[var(--text-muted)] text-sm">
              请输入管理员账号密码登录
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={lockoutTime > 0}
                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all disabled:opacity-50"
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={lockoutTime > 0}
                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all disabled:opacity-50"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            {/* 验证码 */}
            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                验证码：<span className="text-[var(--neon-green)] font-mono">{captchaData.question}</span>
              </label>
              <div className="flex gap-3">
                <input
                  id="captcha"
                  type="number"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  required
                  disabled={lockoutTime > 0}
                  className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all disabled:opacity-50"
                  placeholder="请输入答案"
                />
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="px-4 py-3 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--neon-green)] hover:border-[var(--neon-green)] transition-all"
                  title="刷新验证码"
                >
                  刷新
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-[rgba(255,0,128,0.1)] border border-[rgba(255,0,128,0.3)] text-[var(--neon-pink)] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* 锁定提示 */}
            {lockoutTime > 0 && (
              <div className="bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.3)] text-[var(--neon-orange)] px-4 py-3 rounded-xl text-sm">
                账户已锁定，剩余时间：{Math.floor(lockoutTime / 60)}分{lockoutTime % 60}秒
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading || lockoutTime > 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? '登录中...' : lockoutTime > 0 ? '已锁定' : '登录'}
            </button>
          </form>

          {/* 返回首页 */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--neon-green)] transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="mt-4 text-center text-xs text-[var(--text-muted)]">
          <p>连续登录失败5次将被锁定15分钟</p>
        </div>
      </div>
    </div>
  );
}