'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

type PostStatus = 'draft' | 'published' | 'archived';

export default function PostEditor() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    status: 'draft' as PostStatus,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin-8ca5e53f792989e9/posts');
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      cover_image: post.cover_image || '',
      status: post.status,
    });
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      cover_image: '',
      status: 'draft',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const url = editingPost
        ? `/api/posts/${editingPost.slug}`
        : '/api/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage(editingPost ? '文章更新成功' : '文章创建成功');
        setEditingPost(null);
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          cover_image: '',
          status: 'draft',
        });
        fetchPosts();
      } else {
        setMessage('操作失败');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setMessage('操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!confirm(`确定要删除 "${post.title}" 吗？`)) return;

    try {
      const response = await fetch(`/api/posts/${post.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('文章删除成功');
        fetchPosts();
      } else {
        setMessage('删除失败');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setMessage('删除失败');
    }
  };

  const getStatusText = (status: PostStatus) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'archived': return '已归档';
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

      {/* Editor */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {editingPost ? '编辑文章' : '创建文章'}
          </h2>
          {!editingPost && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] rounded-lg font-medium transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
            >
              新建文章
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              内容 (Markdown)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all font-mono resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              摘要
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              封面图片 URL
            </label>
            <input
              type="text"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PostStatus })}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
            >
              {saving ? '保存中...' : editingPost ? '更新' : '创建'}
            </button>
            {editingPost && (
              <button
                type="button"
                onClick={() => {
                  setEditingPost(null);
                  setFormData({
                    title: '',
                    content: '',
                    excerpt: '',
                    cover_image: '',
                    status: 'draft',
                  });
                }}
                className="px-6 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:border-[var(--neon-green)] transition-all"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          文章列表 ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">
            暂无文章
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        post.status === 'published'
                          ? 'bg-[rgba(0,255,136,0.2)] text-[var(--neon-green)]'
                          : post.status === 'draft'
                          ? 'bg-[rgba(255,107,53,0.2)] text-[var(--neon-orange)]'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                      }`}
                    >
                      {getStatusText(post.status)}
                    </span>
                    <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-3 py-1.5 text-sm bg-[var(--neon-blue)] hover:opacity-80 text-[var(--bg-primary)] rounded-lg transition"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="px-3 py-1.5 text-sm bg-[var(--neon-pink)] hover:opacity-80 text-[var(--bg-primary)] rounded-lg transition"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}