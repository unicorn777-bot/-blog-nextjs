import { getCategories, getSettings } from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {settings.site_title || '欢迎来到2037'}
            </Link>
            <div className="flex items-center gap-3">
              <nav className="hidden sm:flex gap-4 md:gap-6 mr-4">
                <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                  首页
                </Link>
                <Link href="/categories" className="text-blue-600 dark:text-blue-400 font-medium text-sm md:text-base">
                  分类
                </Link>
                <Link href="/tags" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                  标签
                </Link>
              </nav>
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

      {/* Categories */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            分类
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            按分类浏览文章
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const cat = category as CategoryWithCount;
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {cat.post_count || 0}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-slate-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              暂无分类
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} {settings.site_author || 'Asta333'}. All rights reserved.
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}