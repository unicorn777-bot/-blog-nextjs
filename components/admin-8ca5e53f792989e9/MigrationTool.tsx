'use client';

import { useState } from 'react';

interface MigrationResults {
  posts: string[];
  errors: string[];
}

export default function MigrationTool() {
  const [formData, setFormData] = useState({
    hexoPath: '../my-blog',
    authorEmail: '',
  });
  const [migrating, setMigrating] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<MigrationResults | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMigrating(true);
    setMessage('');
    setResults(null);

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('迁移完成');
        setResults(data.results);
      } else {
        setMessage(data.error || '迁移失败');
      }
    } catch (error) {
      console.error('Error migrating:', error);
      setMessage('迁移失败');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl ${
            message.includes('成功') || message.includes('完成')
              ? 'bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] text-[var(--neon-green)]'
              : 'bg-[rgba(255,0,128,0.1)] border border-[rgba(255,0,128,0.3)] text-[var(--neon-pink)]'
          }`}
        >
          {message}
        </div>
      )}

      {/* Migration Form */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          从 Hexo 迁移数据
        </h2>

        <div className="bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] rounded-xl p-4 mb-6">
          <h3 className="font-medium text-[var(--neon-blue)] mb-2">
            迁移说明
          </h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>• 将 Hexo 博客的相对路径填入下方</li>
            <li>• 提供管理员邮箱地址</li>
            <li>• 迁移将包含：文章、分类、标签</li>
            <li>• 图片需要手动复制到 public/images 目录</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Hexo 博客路径（相对路径）
            </label>
            <input
              type="text"
              value={formData.hexoPath}
              onChange={(e) => setFormData({ ...formData, hexoPath: e.target.value })}
              required
              placeholder="../my-blog"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              管理员邮箱
            </label>
            <input
              type="email"
              value={formData.authorEmail}
              onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
              required
              placeholder="admin@example.com"
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={migrating}
            className="px-6 py-3 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
          >
            {migrating ? '迁移中...' : '开始迁移'}
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            迁移结果
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-[var(--text-primary)] mb-2">
                成功迁移 ({results.posts?.length || 0})
              </h3>
              {results.posts && results.posts.length > 0 && (
                <ul className="space-y-1">
                  {results.posts.map((post, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-[var(--neon-green)]"
                    >
                      ✓ {post}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {results.errors && results.errors.length > 0 && (
              <div>
                <h3 className="font-medium text-[var(--text-primary)] mb-2">
                  失败 ({results.errors.length})
                </h3>
                <ul className="space-y-1">
                  {results.errors.map((error, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-[var(--neon-pink)]"
                    >
                      ✗ {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}