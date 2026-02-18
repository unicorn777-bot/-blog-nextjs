import { getPosts, getSettings } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Hero from '@/components/Hero';
import Pagination from '@/components/Pagination';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';
import HeaderSearch from '@/components/HeaderSearch';
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
      card: 'summary',
      title: settings.site_title || '欢迎来到2037',
      description: settings.site_description || '这是一个关于未来科技和思考的博客',
    },
  };
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
      <main id="posts" className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            最新文章
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            共 {total} 篇
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={{ ...post, categories: post.categories || [], tags: post.tags || [] }} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-slate-300 dark:text-slate-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
              暂无文章
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              前往后台发布文章
            </Link>
          </div>
        )}

        {/* 分页 */}
        <Suspense fallback={null}>
          <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © {new Date().getFullYear()} {settings.site_author || 'Asta333'}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/rss.xml" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm">
                RSS
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link href="https://github.com" target="_blank" rel="noopener" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm">
                GitHub
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {settings.site_title || '欢迎来到2037'}
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <nav className="hidden sm:flex gap-4 md:gap-6 mr-4">
                <Link href="/" className="text-blue-600 dark:text-blue-400 font-medium text-sm md:text-base">
                  首页
                </Link>
                <Link href="/categories" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                  分类
                </Link>
                <Link href="/tags" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                  标签
                </Link>
              </nav>
              <HeaderSearch />
              <ThemeToggle />
              <Link
                href="/admin"
                className="hidden sm:inline-flex px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                管理
              </Link>
            </div>
          </div>
        </div>
      </header>

      <HomeContent page={page} />

      <BackToTop />
    </div>
  );
}