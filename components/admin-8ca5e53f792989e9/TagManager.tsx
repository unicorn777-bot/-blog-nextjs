'use client';

import { useState, useEffect } from 'react';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('标签创建成功');
        setFormData({ name: '' });
        fetchTags();
      } else {
        setMessage('创建失败');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      setMessage('创建失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-muted)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl ${
            message.includes('成功')
              ? 'bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] text-[var(--neon-green)]'
              : 'bg-[rgba(255,0,128,0.1)] border border-[rgba(255,0,128,0.3)] text-[var(--neon-pink)]'
          }`}
        >
          {message}
        </div>
      )}

      {/* Create Tag */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          创建标签
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              标签名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
          >
            {saving ? '创建中...' : '创建标签'}
          </button>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          标签列表 ({tags.length})
        </h2>

        {tags.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">
            暂无标签
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-full"
              >
                <span className="text-[var(--text-primary)] font-medium">
                  #{tag.name}
                </span>
                <span className="ml-2 text-sm text-[var(--text-muted)]">
                  {tag.slug}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
