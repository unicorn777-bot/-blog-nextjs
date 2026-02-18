'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('分类创建成功');
        setFormData({ name: '', description: '' });
        fetchCategories();
      } else {
        setMessage('创建失败');
      }
    } catch (error) {
      console.error('Error creating category:', error);
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

      {/* Create Category */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          创建分类
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              分类名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
          >
            {saving ? '创建中...' : '创建分类'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          分类列表 ({categories.length})
        </h2>

        {categories.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">
            暂无分类
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl"
              >
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {category.slug}
                  </p>
                  {category.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
