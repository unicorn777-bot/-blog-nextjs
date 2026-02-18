import { getCategories, getSettings } from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';
import SearchWrapper from '@/components/SearchWrapper';

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
  post_count?: number;
}

// ISR: 每10分钟重新验证
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    title: `分类 - ${settings.site_title || '欢迎来到2037'}`,
    description: `浏览所有文章分类 - ${settings.site_description || ''}`,
  };
}

export default async function CategoriesPage() {
  const categories = await getCategories();
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

      {/* 主内容 */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 标题 */}
          <div className="text-center mb-12 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              文章分类
            </h1>
            <p className="text-[var(--text-muted)]">
              按主题浏览文章，快速找到感兴趣的内容
            </p>
          </div>

          {/* 分类网格 */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category, index) => {
                const cat = category as CategoryWithCount;
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl transition-all duration-500 hover:border-[rgba(0,255,136,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_30px_rgba(0,255,136,0.1)] hover:-translate-y-2 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--neon-green)] transition-colors">
                        {category.name}
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-[rgba(0,255,136,0.1)] text-[var(--neon-green)] text-sm">
                        {cat.post_count || 0} 篇
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-[var(--text-secondary)] text-sm">
                        {category.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-[var(--neon-green)] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm">查看文章</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
                <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">暂无分类</h3>
              <p className="text-[var(--text-muted)]">文章发布后将自动创建分类</p>
            </div>
          )}
        </div>
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