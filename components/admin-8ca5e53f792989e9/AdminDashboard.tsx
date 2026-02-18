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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              管理后台
            </h1>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {user.name} ({user.role})
                </span>
              )}
              <Link
                href="/"
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition"
              >
                查看网站
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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
