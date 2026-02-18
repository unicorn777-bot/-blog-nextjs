import { getPosts, getSettings } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Hero from '@/components/Hero';
import Pagination from '@/components/Pagination';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';
import SearchWrapper from '@/components/SearchWrapper';
import Link from 'next/link';
import { Metadata } from 'next';
import { Suspense } from 'react';

// ISR: 每10分钟重新验证
export const revalidate = 600;

// 生成元数据
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    title: settings.site_title || '欢迎来到2037',
    description: settings.site_description || '这是一个关于未来科技和思考的博客',
    keywords: settings.site_keywords?.split(',').map(k => k.trim()) || ['未来', '科技', '2037', '博客'],
    authors: [{ name: settings.site_author || 'Asta333' }],
    openGraph: {
      title: settings.site_title || '欢迎来到2037',
      description: settings.site_description || '这是一个关于未来科技和思考的博客',
      type: 'website',
      url: settings.site_url,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.site_title || '欢迎来到2037',
      description: settings.site_description || '这是一个关于未来科技和思考的博客',
    },
  };
}

// 空状态组件
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
      {/* 装饰性图形 */}
      <div className="relative mb-8">
        {/* 外圈 */}
        <div className="w-32 h-32 rounded-full border border-[var(--border-color)] flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
          {/* 中圈 */}
          <div className="w-24 h-24 rounded-full border border-[rgba(0,255,136,0.3)] flex items-center justify-center animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            {/* 内圈 */}
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              {/* 文档图标 */}
              <svg className="w-8 h-8 text-[var(--neon-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* 装饰点 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--neon-green)] animate-pulse" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-[var(--neon-blue)] animate-pulse" />
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--neon-purple)] animate-pulse" />
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--neon-pink)] animate-pulse" />
      </div>

      {/* 文字 */}
      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
        暂无文章
      </h3>
      <p className="text-[var(--text-secondary)] mb-8 text-center max-w-md">
        这里还没有任何文章，去后台发布你的第一篇创作吧！
      </p>
      
      {/* 按钮 */}
      <Link
        href="/admin-8ca5e53f792989e9"
        className="btn-primary flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>发布第一篇文章</span>
      </Link>
    </div>
  );
}

// 首页内容组件
async function HomeContent({ page }: { page: number }) {
  const { posts, total } = await getPosts({ limit: 9, offset: (page - 1) * 9 });
  const settings = await getSettings();
  const totalPages = Math.ceil(total / 9);

  return (
    <>
      {/* Hero 区域 */}
      <Hero 
        title={settings.site_title || '欢迎来到2037'} 
        description={settings.site_description || '这是一个关于未来科技和思考的博客'} 
      />

      {/* 文章列表 */}
      <main id="posts" className="relative py-16 md:py-24">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-[500px] h-[500px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
              right: '-10%',
              top: '20%',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-12 animate-fadeInUp">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                最新文章
              </h2>
              <p className="text-[var(--text-muted)]">
                探索科技前沿，思考未来世界
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--neon-green)]" />
              <span className="text-sm text-[var(--text-secondary)]">
                共 {total} 篇文章
              </span>
            </div>
          </div>

          {/* 文章网格 */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {posts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PostCard post={{ ...post, categories: post.categories || [], tags: post.tags || [] }} />
                  </div>
                ))}
              </div>

              {/* 分页 */}
              <Suspense fallback={null}>
                <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
              </Suspense>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-blue)] flex items-center justify-center">
                <span className="text-[var(--bg-primary)] font-bold text-lg">2</span>
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-semibold">
                  {settings.site_title || '欢迎来到2037'}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  © {new Date().getFullYear()} {settings.site_author || 'Asta333'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/rss.xml" 
                className="text-[var(--text-secondary)] hover:text-[var(--neon-green)] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                </svg>
                <span className="text-sm">RSS</span>
              </Link>
              <Link 
                href="https://github.com" 
                target="_blank" 
                rel="noopener" 
                className="text-[var(--text-secondary)] hover:text-[var(--neon-green)] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
                <span className="text-sm">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// 主页面组件
export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page) : 1;
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-blue)] flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-[var(--bg-primary)] font-bold text-lg">2</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)] hidden sm:block">
                {settings.site_title || '欢迎来到2037'}
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex items-center gap-1">
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--neon-green)] hover:bg-[rgba(0,255,136,0.1)] transition-all"
                >
                  首页
                </Link>
                <Link 
                  href="/categories" 
                  className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--neon-green)] hover:bg-[rgba(0,255,136,0.1)] transition-all"
                >
                  分类
                </Link>
                <Link 
                  href="/tags" 
                  className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--neon-green)] hover:bg-[rgba(0,255,136,0.1)] transition-all"
                >
                  标签
                </Link>
              </nav>
              
              <div className="flex items-center gap-2">
                <SearchWrapper />
                <ThemeToggle />
                <Link
                  href="/admin-8ca5e53f792989e9"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] text-[var(--bg-primary)] font-medium transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>管理</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <HomeContent page={page} />

      <BackToTop />
    </div>
  );
}