import { getPostBySlug, incrementPostViewCount, getSettings } from '@/lib/db';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CommentSection from '@/components/CommentSection';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {settings.site_title || '欢迎来到2037'}
            </Link>
            <nav className="flex gap-4 md:gap-6">
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
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-6 md:mb-8">
          <time dateTime={post.published_at?.toISOString()}>
            {post.published_at && formatDate(post.published_at)}
          </time>
          <span>•</span>
          <span>{timeAgo(post.published_at || post.created_at)}</span>
          <span>•</span>
          <span>{post.view_count} 次阅读</span>
        </div>

        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="px-2 md:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-2 md:px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs md:text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-sm md:prose-base lg:prose-lg
            prose-headings:text-slate-900 dark:prose-headings:text-slate-100
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-code:bg-slate-100 dark:prose-code:bg-slate-800
            prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950
            prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Navigation */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
        </div>

        {/* Comments */}
        {enableComments && (
          <CommentSection postId={post.id} />
        )}
      </article>

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