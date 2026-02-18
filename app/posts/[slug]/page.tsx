import { getPostBySlug, incrementPostViewCount, getSettings, getPosts } from '@/lib/db';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CommentSection from '@/components/CommentSection';
import ThemeToggle from '@/components/ThemeToggle';
import BackToTop from '@/components/BackToTop';
import TOC from '@/components/TOC';

// 动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 600;

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {settings.site_title || '欢迎来到2037'}
            </Link>
            <div className="flex items-center gap-3">
              <nav className="hidden sm:flex gap-4 md:gap-6 mr-4">
                <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                  首页
                </Link>
                <Link href="/categories" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                  分类
                </Link>
                <Link href="/tags" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                  标签
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <article className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* 封面图 */}
        {post.cover_image && (
          <div className="mb-6 md:mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-48 md:h-72 object-cover"
            />
          </div>
        )}

        {/* 标题 */}
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-6 md:mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time dateTime={post.published_at?.toISOString()}>
              {post.published_at && formatDate(post.published_at)}
            </time>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{timeAgo(post.published_at || post.created_at)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{post.view_count} 次阅读</span>
          </div>
        </div>

        {/* 分类 */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors"
              >
                <span className="text-xs">#</span>
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* 文章内容 */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-sm md:prose-base lg:prose-lg
            prose-headings:text-slate-900 dark:prose-headings:text-slate-100
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-code:bg-slate-100 dark:prose-code:bg-slate-800
            prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
            prose-img:rounded-xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* 文章底部导航 */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </Link>
            
            {/* 分享按钮 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">分享：</span>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('链接已复制到剪贴板');
                  }
                }}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 评论区 */}
        {enableComments && (
          <CommentSection postId={post.id} />
        )}
      </article>

      {/* 目录 TOC */}
      <TOC content={htmlContent} />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            © {new Date().getFullYear()} {settings.site_author || 'Asta333'}. All rights reserved.
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
