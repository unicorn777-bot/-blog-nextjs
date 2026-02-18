'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import PostEditor from './PostEditor';
import CategoryManager from './CategoryManager';
import TagManager from './TagManager';
import MigrationTool from './MigrationTool';
import CommentManager from './CommentManager';
import SettingsManager from './SettingsManager';

interface UserInfo {
  name?: string;
  email?: string;
  role?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'tags' | 'comments' | 'settings' | 'migrate'>('posts');
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // 获取用户信息
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user as UserInfo);
        }
      });
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const tabs = [
    { key: 'posts', label: '文章管理' },
    { key: 'categories', label: '分类管理' },
    { key: 'tags', label: '标签管理' },
    { key: 'comments', label: '评论管理' },
    { key: 'settings', label: '网站配置' },
    { key: 'migrate', label: '数据迁移' },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-blue)] flex items-center justify-center">
                <span className="text-[var(--bg-primary)] font-bold text-lg">2</span>
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                管理后台
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-[var(--text-muted)]">
                  {user.name} ({user.role})
                </span>
              )}
              <Link
                href="/"
                className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium rounded-lg hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] transition-all"
              >
                查看网站
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[rgba(255,0,128,0.2)] border border-[rgba(255,0,128,0.3)] text-[var(--neon-pink)] text-sm font-medium rounded-lg hover:bg-[rgba(255,0,128,0.3)] transition-all"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-[var(--neon-green)] border-b-2 border-[var(--neon-green)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'posts' && <PostEditor />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'tags' && <TagManager />}
        {activeTab === 'comments' && <CommentManager />}
        {activeTab === 'settings' && <SettingsManager />}
        {activeTab === 'migrate' && <MigrationTool />}
      </main>
    </div>
  );
}