'use client';

import { useState, useEffect } from 'react';

interface Settings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  site_url: string;
  posts_per_page: string;
  enable_comments: string;
  comment_moderation: string;
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('配置保存成功');
        // 触发页面重新验证
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'default-secret' }),
        });
      } else {
        setMessage('保存失败');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-muted)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-4 py-3 rounded-xl ${
          message.includes('成功')
            ? 'bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] text-[var(--neon-green)]'
            : 'bg-[rgba(255,0,128,0.1)] border border-[rgba(255,0,128,0.3)] text-[var(--neon-pink)]'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          网站配置
        </h2>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                网站标题
              </label>
              <input
                type="text"
                value={settings.site_title || ''}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                网站作者
              </label>
              <input
                type="text"
                value={settings.site_author || ''}
                onChange={(e) => setSettings({ ...settings, site_author: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              网站描述
            </label>
            <textarea
              value={settings.site_description || ''}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              网站关键词（用逗号分隔）
            </label>
            <input
              type="text"
              value={settings.site_keywords || ''}
              onChange={(e) => setSettings({ ...settings, site_keywords: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              网站URL
            </label>
            <input
              type="url"
              value={settings.site_url || ''}
              onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          {/* 显示设置 */}
          <div className="border-t border-[var(--border-color)] pt-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
              显示设置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  每页文章数
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.posts_per_page || '10'}
                  onChange={(e) => setSettings({ ...settings, posts_per_page: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* 评论设置 */}
          <div className="border-t border-[var(--border-color)] pt-6">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
              评论设置
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enable_comments"
                  checked={settings.enable_comments === 'true'}
                  onChange={(e) => setSettings({ ...settings, enable_comments: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--neon-green)] focus:ring-[var(--neon-green)]"
                />
                <label htmlFor="enable_comments" className="text-sm text-[var(--text-secondary)]">
                  启用评论功能
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="comment_moderation"
                  checked={settings.comment_moderation === 'true'}
                  onChange={(e) => setSettings({ ...settings, comment_moderation: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--neon-green)] focus:ring-[var(--neon-green)]"
                />
                <label htmlFor="comment_moderation" className="text-sm text-[var(--text-secondary)]">
                  评论需要审核
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </form>
    </div>
  );
}