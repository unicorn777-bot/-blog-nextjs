'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  content: string;
}

export default function TOC({ content }: TOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // 提取标题
  useEffect(() => {
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4');
      const items: TOCItem[] = [];
      
      headingElements.forEach((heading) => {
        const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
        if (!heading.id) {
          heading.id = id;
        }
        
        items.push({
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.charAt(1)),
        });
      });
      
      setHeadings(items);
    };

    // 延迟执行，等待内容渲染
    const timer = setTimeout(extractHeadings, 100);
    return () => clearTimeout(timer);
  }, [content]);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      // 显示/隐藏 TOC
      setIsVisible(window.scrollY > 300);

      // 高亮当前标题
      const headingElements = document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4');
      let currentId = '';

      headingElements.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = heading.id;
        }
      });

      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div 
      ref={tocRef}
      className={`fixed right-6 top-32 z-40 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
      }`}
    >
      <div className="w-56 p-4 bg-[var(--bg-secondary)]/80 backdrop-blur-lg border border-[var(--border-color)] rounded-xl shadow-xl">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-color)]">
          <svg className="w-4 h-4 text-[var(--neon-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="text-sm font-medium text-[var(--text-primary)]">目录</span>
        </div>

        {/* 标题列表 */}
        <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg transition-all ${
                activeId === heading.id
                  ? 'text-[var(--neon-green)] bg-[rgba(0,255,136,0.1)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
              style={{ 
                paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
              }}
            >
              <span className="line-clamp-1">{heading.text}</span>
            </button>
          ))}
        </nav>

        {/* 进度指示器 */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>阅读进度</span>
            <span>{headings.findIndex(h => h.id === activeId) + 1} / {headings.length}</span>
          </div>
          <div className="mt-2 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] transition-all duration-300"
              style={{ 
                width: `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}