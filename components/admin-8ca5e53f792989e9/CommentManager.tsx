'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  created_at: string;
  post_title?: string;
}

type CommentStatus = 'pending' | 'approved' | 'spam' | 'trash' | 'all';

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CommentStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin-8ca5e53f792989e9/comments?status=${statusFilter}&page=${page}&limit=10`);
      const data = await response.json();
      setComments(data.comments || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: CommentStatus) => {
    try {
      const response = await fetch(`/api/admin-8ca5e53f792989e9/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessage('状态更新成功');
        fetchComments();
      } else {
        setMessage('更新失败');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setMessage('更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await fetch(`/api/admin-8ca5e53f792989e9/comments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('评论已删除');
        fetchComments();
      } else {
        setMessage('删除失败');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setMessage('删除失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-[rgba(255,107,53,0.2)] text-[var(--neon-orange)]',
      approved: 'bg-[rgba(0,255,136,0.2)] text-[var(--neon-green)]',
      spam: 'bg-[rgba(255,0,128,0.2)] text-[var(--neon-pink)]',
      trash: 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
    };
    const labels: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      spam: '垃圾',
      trash: '回收站',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-muted)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-4 py-3 rounded-xl ${
          message.includes('成功') || message.includes('已删除')
            ? 'bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] text-[var(--neon-green)]'
            : 'bg-[rgba(255,0,128,0.1)] border border-[rgba(255,0,128,0.3)] text-[var(--neon-pink)]'
        }`}>
          {message}
        </div>
      )}

      {/* 筛选器 */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'spam', 'trash'] as CommentStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl transition-all ${
              statusFilter === s
                ? 'bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--neon-green)] hover:text-[var(--neon-green)]'
            }`}
          >
            {s === 'all' ? '全部' : s === 'pending' ? '待审核' : s === 'approved' ? '已通过' : s === 'spam' ? '垃圾' : '回收站'}
          </button>
        ))}
      </div>

      {/* 评论列表 */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            暂无评论
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-[var(--text-primary)]">
                        {comment.author_name}
                      </span>
                      {comment.author_email && (
                        <span className="text-sm text-[var(--text-muted)]">
                          ({comment.author_email})
                        </span>
                      )}
                      {getStatusBadge(comment.status)}
                    </div>
                    <p className="text-[var(--text-secondary)] mb-2 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                      <span>{formatDate(comment.created_at)}</span>
                      {comment.post_title && (
                        <span>文章: {comment.post_title}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        className="px-3 py-1.5 text-sm bg-[var(--neon-green)] hover:opacity-80 text-[var(--bg-primary)] rounded-lg transition"
                      >
                        通过
                      </button>
                    )}
                    {comment.status !== 'spam' && (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'spam')}
                        className="px-3 py-1.5 text-sm bg-[var(--neon-orange)] hover:opacity-80 text-[var(--bg-primary)] rounded-lg transition"
                      >
                        垃圾
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="px-3 py-1.5 text-sm bg-[var(--neon-pink)] hover:opacity-80 text-[var(--bg-primary)] rounded-lg transition"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl disabled:opacity-50 hover:border-[var(--neon-green)] transition-all"
          >
            上一页
          </button>
          <span className="px-4 py-2 text-[var(--text-secondary)]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl disabled:opacity-50 hover:border-[var(--neon-green)] transition-all"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}