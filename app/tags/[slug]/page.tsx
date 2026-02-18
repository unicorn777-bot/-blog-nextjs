import { getTagBySlug, getPosts, getSettings } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { Metadata } from 'next';

// 动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 600;

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  const settings = await getSettings();

  if (!tag) {
    return { title: '标签未找到' };
  }

  return {
    title: `#${tag.name} - ${settings.site_title || '欢迎来到2037'}`,
    description: `${tag.name}标签下的所有文章`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  const settings = await getSettings();

  if (!tag) {
    notFound();
  }

  const { posts } = await getPosts({
    limit: 100,
    status: 'published',
    tagSlug: slug,
  });

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
              <Link href="/admin-8ca5e53f792989e9" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition text-sm md:text-base">
                管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Tag Header */}
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="mb-4">
          <Link href="/tags" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm">
            ← 返回标签列表
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3 md:mb-4">
          #{tag.name}
        </h1>
        <p className="text-sm text-slate-500">
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
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              该标签下暂无文章
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