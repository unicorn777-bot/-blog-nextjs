import Link from 'next/link';
import Image from 'next/image';
import { formatDate, timeAgo } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    created_at: Date;
    published_at: Date | null;
    view_count: number;
    categories: Array<{ id: string; name: string; slug: string }>;
    tags: Array<{ id: string; name: string; slug: string }>;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const displayDate = post.published_at || post.created_at;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block h-full"
    >
      <article className="relative h-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden transition-all duration-500 hover:border-[rgba(0,255,136,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_30px_rgba(0,255,136,0.1)] hover:-translate-y-2">
        {/* 封面图片 */}
        {post.cover_image ? (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
            {/* 装饰性图案 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-20 h-20 border border-[var(--neon-green)] rounded-full" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border border-[var(--neon-blue)] rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-[var(--neon-purple)] rounded-full" />
            </div>
            <svg className="w-16 h-16 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}

        {/* 内容 */}
        <div className="p-6">
          {/* 分类标签 */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-[rgba(0,255,136,0.1)] text-[var(--neon-green)] border border-[rgba(0,255,136,0.2)]"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* 标题 */}
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--neon-green)] transition-colors">
            {post.title}
          </h2>

          {/* 摘要 */}
          <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
            {post.excerpt || '点击查看文章详情...'}
          </p>

          {/* 元信息 */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <time dateTime={displayDate instanceof Date ? displayDate.toISOString() : String(displayDate)}>
              {formatDate(displayDate)}
            </time>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.view_count}
              </span>
              <span>{timeAgo(displayDate)}</span>
            </div>
          </div>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--neon-blue)] transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 悬浮光效 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--neon-green)] to-transparent" />
        </div>
      </article>
    </Link>
  );
}