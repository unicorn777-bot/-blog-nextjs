'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string | null;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 搜索函数
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts?search=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      setResults(data.posts || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // 点击外部关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl" />

      {/* 模态框 */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
      >
        {/* 搜索输入 */}
        <div className="relative">
          <svg 
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章..."
            className="w-full pl-14 pr-14 py-5 bg-transparent text-[var(--text-primary)] text-lg placeholder-[var(--text-muted)] border-none outline-none"
          />
          <button
            onClick={onClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 分割线 */}
        <div className="h-px bg-[var(--border-color)]" />

        {/* 搜索结果 */}
        <div className="max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--neon-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : query.trim() === '' ? (
            <div className="py-12 text-center text-[var(--text-muted)]">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>输入关键词开始搜索</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)]">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>未找到相关文章</p>
              <p className="text-sm mt-2">试试其他关键词？</p>
            </div>
          ) : (
            <ul className="py-2">
              {results.map((result, index) => (
                <li key={result.id}>
                  <Link
                    href={`/posts/${result.slug}`}
                    onClick={onClose}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--bg-tertiary)] transition-colors group"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[rgba(0,255,136,0.1)] text-[var(--neon-green)] flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--neon-green)] transition-colors truncate">
                        {result.title}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                        {result.excerpt || '暂无摘要'}
                      </p>
                    </div>
                    <svg 
                      className="flex-shrink-0 w-5 h-5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>按 ESC 关闭</span>
            <span>找到 {results.length} 个结果</span>
          </div>
        </div>
      </div>
    </div>
  );
}