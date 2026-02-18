import { getTags, getSettings } from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';
import SearchWrapper from '@/components/SearchWrapper';

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
                  className="px-4 py-2 rounded-lg text-[var(--neon-green)] bg-[rgba(0,255,136,0.1)] transition-all"
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
              文章标签
            </h1>
            <p className="text-[var(--text-muted)]">
              通过标签发现更多相关内容
            </p>
          </div>

          {/* 标签云 */}
          {tags.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3 animate-fadeInUp delay-200">
              {tags.map((tag, index) => {
                const t = tag as TagWithCount;
                const count = t.post_count || 0;
                // 根据文章数量调整大小
                const size = count > 10 ? 'text-xl px-6 py-3' : count > 5 ? 'text-lg px-5 py-2.5' : 'text-base px-4 py-2';
                
                return (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className={`${size} rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all duration-300 group`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="flex items-center gap-2">
                      <span>{tag.name}</span>
                      <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--neon-green)]">
                        ({count})
                      </span>
                    </span>
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
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">暂无标签</h3>
              <p className="text-[var(--text-muted)]">文章发布后将自动创建标签</p>
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