'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      // 滚动超过 300px 显示
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // 计算滚动进度
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full
        bg-[var(--bg-secondary)] 
        border border-[var(--border-color)]
        flex items-center justify-center
        transition-all duration-500 ease-out
        hover:border-[var(--neon-green)]
        hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]
        group
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10 pointer-events-none'
        }
      `}
      aria-label="返回顶部"
    >
      {/* 进度环 */}
      <svg 
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="var(--neon-green)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${scrollProgress * 1.38} 138`}
          className="transition-all duration-150"
        />
      </svg>

      {/* 箭头图标 */}
      <svg 
        className="w-5 h-5 text-[var(--neon-green)] transition-transform duration-300 group-hover:-translate-y-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
}