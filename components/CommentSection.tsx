'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface Comment {
  id: string;
  author_name: string;
  author_url: string | null;
  content: string;
  created_at: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    author_url: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?post_id=${postId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          post_id: postId,
          parent_id: parentId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('评论已提交，等待审核');
        setFormData({
          author_name: '',
          author_email: '',
          author_url: '',
          content: '',
        });
        setReplyingTo(null);
      } else {
        setMessage(data.error || '提交失败');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setMessage('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div 
      key={comment.id} 
      className={`${depth > 0 ? 'ml-8 border-l-2 border-[var(--border-color)] pl-4' : ''} mb-4`}
    >
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-blue)] flex items-center justify-center text-[var(--bg-primary)] font-bold text-sm">
              {comment.author_name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-[var(--text-primary)]">
              {comment.author_url ? (
                <a href={comment.author_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--neon-green)] transition-colors">
                  {comment.author_name}
                </a>
              ) : (
                comment.author_name
              )}
            </span>
          </div>
          <time className="text-sm text-[var(--text-muted)]">
            {formatDate(comment.created_at)}
          </time>
        </div>
        <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
          {comment.content}
        </p>
        <button
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="mt-2 text-sm text-[var(--neon-green)] hover:text-[var(--neon-blue)] transition-colors"
        >
          {replyingTo === comment.id ? '取消回复' : '回复'}
        </button>
      </div>

      {replyingTo === comment.id && (
        <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 ml-4">
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="写下你的回复..."
            required
            rows={3}
            className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] text-sm font-medium rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交回复'}
            </button>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm rounded-lg hover:text-[var(--text-primary)] hover:border-[var(--neon-green)] transition-all"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-muted)]">加载评论中...</div>;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        评论 ({comments.length})
      </h3>

      {/* 评论表单 */}
      <form onSubmit={(e) => handleSubmit(e)} className="mb-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          发表评论
        </h4>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-xl ${
            message.includes('成功') || message.includes('等待审核')
              ? 'bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] text-[var(--neon-green)]'
              : 'bg-[rgba(255,0,128,0.1)] border border-[rgba(255,0,128,0.3)] text-[var(--neon-pink)]'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              姓名 *
            </label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={formData.author_email}
              onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              网站
            </label>
            <input
              type="url"
              value={formData.author_url}
              onChange={(e) => setFormData({ ...formData, author_url: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            评论内容 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={4}
            maxLength={2000}
            placeholder="写下你的评论..."
            className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)] focus:ring-1 focus:ring-[var(--neon-green)] transition-all resize-none"
          />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {formData.content.length}/2000 字符
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-semibold rounded-xl transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] disabled:opacity-50"
        >
          {submitting ? '提交中...' : '提交评论'}
        </button>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          * 评论需要审核后才会显示
        </p>
      </form>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-muted)]">
          暂无评论，快来发表第一条评论吧！
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
}