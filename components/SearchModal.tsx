'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const searchPosts = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/posts?search=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        setResults(data.posts || []);
      } catch (error) {
        console.error('搜索失败:', error);
        setResults([]);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchPosts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 搜索框 */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* 输入区域 */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700">
          <svg
            className="w-5 h-5 ml-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章..."
            className="flex-1 px-4 py-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            ESC
          </button>
        </div>

        {/* 结果区域 */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              未找到相关文章
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={`/posts/${result.slug}`}
                    onClick={onClose}
                    className="block px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {result.title}
                    </h4>
                    {result.excerpt && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {result.excerpt}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!query && (
            <div className="p-8 text-center text-slate-400">
              输入关键词开始搜索
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
