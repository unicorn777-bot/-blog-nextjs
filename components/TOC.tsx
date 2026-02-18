'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [isOpen, setIsOpen] = useState(true);
  const tocRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 从内容中提取标题
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const items: TOCItem[] = [];
    headingElements.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      heading.id = id;
      items.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      });
    });
    
    setHeadings(items);
  }, [content]);

  useEffect(() => {
    // 监听滚动，高亮当前标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

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
    <aside
      ref={tocRef}
      className="hidden lg:block fixed right-8 top-32 w-64 max-h-[calc(100vh-160px)] overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            目录
          </h3>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        
        {isOpen && (
          <nav className="mt-3 space-y-1">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors duration-200 ${
                  heading.level === 2
                    ? 'pl-2'
                    : heading.level === 3
                    ? 'pl-4'
                    : heading.level === 4
                    ? 'pl-6'
                    : 'pl-2'
                } ${
                  activeId === heading.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="line-clamp-2">{heading.text}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
