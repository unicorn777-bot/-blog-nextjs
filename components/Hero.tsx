'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface HeroProps {
  title: string;
  description: string;
}

// 打字机效果 Hook
function useTypewriter(text: string, speed: number = 50, delay: number = 500) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
}

export default function Hero({ title, description }: HeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { displayText, isComplete } = useTypewriter(description, 30, 800);

  // 鼠标跟踪效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* 背景光晕效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 主光晕 - 绿色 */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 animate-glowPulse"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, transparent 70%)',
            left: '20%',
            top: '30%',
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        
        {/* 次光晕 - 蓝色 */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-25 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%)',
            right: '15%',
            bottom: '20%',
            transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
            transition: 'transform 0.4s ease-out',
          }}
        />
        
        {/* 第三光晕 - 紫色 */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 animate-floatReverse"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
            left: '60%',
            top: '60%',
          }}
        />

        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* 扫描线效果 */}
        <div className="absolute inset-0 opacity-5 scanlines" />
      </div>

      {/* 装饰性几何元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 旋转的圆环 */}
        <div 
          className="absolute w-[300px] h-[300px] border border-[rgba(0,255,136,0.2)] rounded-full animate-spin"
          style={{ left: '10%', top: '20%' }}
        />
        <div 
          className="absolute w-[200px] h-[200px] border border-[rgba(0,212,255,0.2)] rounded-full animate-spin"
          style={{ right: '15%', bottom: '30%', animationDirection: 'reverse', animationDuration: '30s' }}
        />
        
        {/* 浮动的点 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 3 === 0 ? 'var(--neon-green)' : i % 3 === 1 ? 'var(--neon-blue)' : 'var(--neon-purple)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.4,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* 标签 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.05)] mb-8 animate-fadeInDown">
          <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
          <span className="text-sm text-[var(--text-secondary)] tracking-wider uppercase">
            探索未来 · 思考科技
          </span>
        </div>

        {/* 主标题 */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fadeInUp">
          <span className="gradient-text">{title}</span>
        </h1>

        {/* 副标题 - 打字机效果 */}
        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 h-8 animate-fadeIn delay-300">
          {displayText}
          <span 
            className={`inline-block w-0.5 h-5 ml-1 bg-[var(--neon-green)] ${isComplete ? 'animate-pulse' : ''}`}
            style={{ animation: isComplete ? 'blink 1s step-end infinite' : 'none' }}
          />
        </p>

        {/* 按钮组 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp delay-500">
          <Link 
            href="#posts" 
            className="btn-primary flex items-center gap-2 group"
          >
            <span>浏览文章</span>
            <svg 
              className="w-4 h-4 transition-transform group-hover:translate-y-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Link>
          <Link 
            href="/admin" 
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>管理后台</span>
          </Link>
        </div>

        {/* 滚动提示 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}