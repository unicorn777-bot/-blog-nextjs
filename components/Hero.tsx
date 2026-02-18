'use client';

import { useState, useEffect } from 'react';

interface HeroProps {
  title: string;
  description: string;
}

export default function Hero({ title, description }: HeroProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // 打字机效果
  useEffect(() => {
    if (!description) return;
    
    let index = 0;
    const timer = setInterval(() => {
      if (index <= description.length) {
        setDisplayedText(description.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [description]);

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* 动态背景 */}
      <div className="absolute inset-0 -z-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        {/* 动态光斑 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* 内容 */}
      <div className="container mx-auto px-4 text-center relative">
        {/* 装饰元素 */}
        <div className="absolute top-0 left-10 w-20 h-20 border border-blue-200 dark:border-blue-800 rounded-full opacity-50 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-0 right-10 w-16 h-16 border border-purple-200 dark:border-purple-800 rounded-full opacity-50 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        
        {/* 标题 */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6 relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            {title}
          </span>
          {/* 标题下划线动画 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
        </h1>

        {/* 副标题（打字机效果） */}
        <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto min-h-[2em]">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-0.5 h-5 ml-1 bg-blue-500 animate-pulse" />
          )}
        </p>

        {/* 装饰按钮 */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#posts"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            浏览文章
          </a>
          <a
            href="/admin"
            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-full shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-0.5"
          >
            管理后台
          </a>
        </div>

        {/* 滚动提示 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
