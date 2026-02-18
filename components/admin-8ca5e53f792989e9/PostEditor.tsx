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
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.includes('成功')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Editor */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {editingPost ? '编辑文章' : '创建文章'}
          </h2>
          {!editingPost && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              新建文章
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              内容 (Markdown)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              摘要
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              封面图片 URL
            </label>
            <input
              type="text"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PostStatus })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
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
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          文章列表 ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            暂无文章
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        post.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : post.status === 'draft'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
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
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition"
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
