import { getTags, getSettings } from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';

interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  post_count?: number;
}

// ISR: 每10分钟重新验证
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    title: `标签 - ${settings.site_title || '欢迎来到2037'}`,
    description: `浏览所有文章标签 - ${settings.site_description || ''}`,
  };
}

export default async function TagsPage() {
  const tags = await getTags();
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {settings.site_title || '欢迎来到2037'}
            </Link>
            <nav className="flex gap-3 md:gap-6">
              <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                首页
              </Link>
              <Link href="/categories" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                分类
              </Link>
              <Link href="/tags" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                标签
              </Link>
              <Link href="/admin" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Tags */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 md:mb-8">
          标签
        </h1>

        <div className="flex flex-wrap gap-2 md:gap-3">
          {tags.map((tag) => {
            const t = tag as TagWithCount;
            return (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:shadow-lg transition group flex items-center gap-2"
              >
                <span className="text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition text-sm md:text-base">
                  {tag.name}
                </span>
                <span className="text-xs md:text-sm text-slate-500 dark:text-slate-500">
                  ({t.post_count || 0})
                </span>
              </Link>
            );
          })}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              暂无标签
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            © {new Date().getFullYear()} {settings.site_author || 'Asta333'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
