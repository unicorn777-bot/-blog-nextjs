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
      const response = await fetch(`/api/admin/comments?status=${statusFilter}&page=${page}&limit=10`);
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
      const response = await fetch(`/api/admin/comments/${id}`, {
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
      const response = await fetch(`/api/admin/comments/${id}`, {
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
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      approved: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      spam: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      trash: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
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
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.includes('成功') || message.includes('已删除')
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
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
            className={`px-4 py-2 rounded-lg transition ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {s === 'all' ? '全部' : s === 'pending' ? '待审核' : s === 'approved' ? '已通过' : s === 'spam' ? '垃圾' : '回收站'}
          </button>
        ))}
      </div>

      {/* 评论列表 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            暂无评论
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {comment.author_name}
                      </span>
                      {comment.author_email && (
                        <span className="text-sm text-slate-500">
                          ({comment.author_email})
                        </span>
                      )}
                      {getStatusBadge(comment.status)}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
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
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition"
                      >
                        通过
                      </button>
                    )}
                    {comment.status !== 'spam' && (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'spam')}
                        className="px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition"
                      >
                        垃圾
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition"
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
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-4 py-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
