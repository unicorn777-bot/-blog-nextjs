import { getCategoryBySlug, getPosts, getSettings } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { Metadata } from 'next';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';
import SearchWrapper from '@/components/SearchWrapper';

// 动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 600;

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const settings = await getSettings();

  if (!category) {
    return { title: '分类未找到' };
  }

  return {
    title: `${category.name} - ${settings.site_title || '欢迎来到2037'}`,
    description: category.description || `${category.name}分类下的所有文章`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const settings = await getSettings();

  if (!category) {
    notFound();
  }

  const { posts } = await getPosts({
    limit: 100,
    status: 'published',
    categorySlug: slug,
  });

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
                  className="px-4 py-2 rounded-lg text-[var(--neon-green)] bg-[rgba(0,255,136,0.1)] transition-all"
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
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Header */}
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-4xl pt-28">
        <div className="mb-4">
          <Link href="/categories" className="text-[var(--neon-green)] hover:text-[var(--neon-blue)] text-sm transition-colors">
            ← 返回分类列表
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 md:mb-4">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-base md:text-lg text-[var(--text-secondary)]">
            {category.description}
          </p>
        )}
        <p className="text-sm text-[var(--text-muted)] mt-2">
          共 {posts.length} 篇文章
        </p>
      </section>

      {/* Posts */}
      <main className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={{ ...post, categories: post.categories || [], tags: post.tags || [] }} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)] text-lg">
              该分类下暂无文章
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            © {new Date().getFullYear()} {settings.site_author || 'Asta333'}. All rights reserved.
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
