import { getPostBySlug, incrementPostViewCount, getSettings } from '@/lib/db';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CommentSection from '@/components/CommentSection';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';
import SearchWrapper from '@/components/SearchWrapper';

// 动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 600;

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ year: string; month: string; day: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const settings = await getSettings();

  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: `${post.title} - ${settings.site_title || '欢迎来到2037'}`,
    description: post.excerpt || post.content.slice(0, 160),
    keywords: post.tags?.map(t => t.name).join(', ') || settings.site_keywords,
    authors: [{ name: settings.site_author || 'Asta333' }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: 'article',
      publishedTime: post.published_at?.toISOString(),
      modifiedTime: post.updated_at.toISOString(),
      authors: [settings.site_author || 'Asta333'],
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  };
}

export default async function HexoPostPage({ params }: { params: Promise<{ year: string; month: string; day: string; slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const settings = await getSettings();

  if (!post) {
    notFound();
  }

  // 增加阅读量
  await incrementPostViewCount(post.id);

  const htmlContent = parseMarkdown(post.content);
  const enableComments = settings.enable_comments !== 'false';

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
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="pt-24 pb-16">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Title */}
          <header className={`mb-12 ${post.cover_image ? '-mt-32 relative z-10' : 'pt-8'}`}>
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 animate-fadeInDown">
                {post.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="px-4 py-1.5 rounded-full bg-[rgba(0,255,136,0.1)] text-[var(--neon-green)] text-sm font-medium border border-[rgba(0,255,136,0.2)] hover:bg-[rgba(0,255,136,0.2)] transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 leading-tight animate-fadeInUp">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)] animate-fadeIn delay-200">
              <time dateTime={post.published_at?.toISOString()}>
                {post.published_at && formatDate(post.published_at)}
              </time>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span>{timeAgo(post.published_at || post.created_at)}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.view_count} 次阅读
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 animate-fadeIn delay-300">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm hover:text-[var(--neon-blue)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none animate-fadeInUp delay-400"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-[var(--border-color)]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--neon-green)] hover:text-[var(--neon-blue)] transition-colors group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>返回首页</span>
            </Link>
          </div>

          {/* Comments */}
          {enableComments && (
            <div className="mt-16">
              <CommentSection postId={post.id} />
            </div>
          )}
        </div>
      </article>

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