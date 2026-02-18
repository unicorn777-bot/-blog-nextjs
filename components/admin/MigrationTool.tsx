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
          className={`px-4 py-3 rounded-lg ${
            message.includes('成功') || message.includes('完成')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Migration Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          从 Hexo 迁移数据
        </h2>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            迁移说明
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 将 Hexo 博客的相对路径填入下方</li>
            <li>• 提供管理员邮箱地址</li>
            <li>• 迁移将包含：文章、分类、标签</li>
            <li>• 图片需要手动复制到 public/images 目录</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Hexo 博客路径（相对路径）
            </label>
            <input
              type="text"
              value={formData.hexoPath}
              onChange={(e) => setFormData({ ...formData, hexoPath: e.target.value })}
              required
              placeholder="../my-blog"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              管理员邮箱
            </label>
            <input
              type="email"
              value={formData.authorEmail}
              onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
              required
              placeholder="admin@example.com"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={migrating}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {migrating ? '迁移中...' : '开始迁移'}
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            迁移结果
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                成功迁移 ({results.posts?.length || 0})
              </h3>
              {results.posts && results.posts.length > 0 && (
                <ul className="space-y-1">
                  {results.posts.map((post, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-green-700 dark:text-green-400"
                    >
                      ✓ {post}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {results.errors && results.errors.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  失败 ({results.errors.length})
                </h3>
                <ul className="space-y-1">
                  {results.errors.map((error, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-red-700 dark:text-red-400"
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
