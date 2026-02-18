import { NextResponse } from 'next/server';
import { getPosts, getSettings } from '@/lib/db';

export async function GET() {
  try {
    const [{ posts }, settings] = await Promise.all([
      getPosts({ limit: 20, status: 'published' }),
      getSettings(),
    ]);

    const siteTitle = settings.site_title || '欢迎来到2037';
    const siteDescription = settings.site_description || '这是一个关于未来科技和思考的博客';
    const siteUrl = settings.site_url || 'https://102037.xyz';
    const siteAuthor = settings.site_author || 'Asta333';

    const rssItems = posts.map(post => {
      const postUrl = `${siteUrl}/posts/${post.slug}`;
      const pubDate = post.published_at 
        ? new Date(post.published_at).toUTCString()
        : new Date(post.created_at).toUTCString();
      
      // 处理内容，转义 XML 特殊字符
      const escapeXml = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const description = post.excerpt 
        ? escapeXml(post.excerpt)
        : escapeXml(post.content.substring(0, 200));

      const categories = post.categories?.map(c => `<category>${escapeXml(c.name)}</category>`).join('\n        ') || '';
      const tags = post.tags?.map(t => `<category>${escapeXml(t.name)}</category>`).join('\n        ') || '';
      const allCategories = [...new Set([...(categories ? categories.split('\n') : []), ...(tags ? tags.split('\n') : [])])].filter(Boolean).join('\n        ');

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${description}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(siteAuthor)}</author>
      ${allCategories}
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js Blog</generator>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
