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
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Cover Image */}
      {post.cover_image && (
        <div className="h-48 overflow-hidden relative">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex gap-2 mb-3">
            {post.categories.slice(0, 2).map((category) => (
              <span
                key={category.id}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
          <time dateTime={displayDate instanceof Date ? displayDate.toISOString() : String(displayDate)}>
            {formatDate(displayDate)}
          </time>
          <div className="flex items-center gap-3">
            <span>{timeAgo(displayDate)}</span>
            <span>·</span>
            <span>{post.view_count} 次阅读</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
