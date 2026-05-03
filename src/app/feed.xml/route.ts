import { getAllBlogPosts } from '@/lib/mdx';
import { getSiteConfig } from '@/lib/config';

const XML_ENTITIES: Record<string, string> = {
  '&': '\x26amp;',
  '<': '\x26lt;',
  '>': '\x26gt;',
  '"': '\x26quot;',
  "'": '\x26apos;',
};

function escapeXml(s: string): string {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => XML_ENTITIES[c] ?? c);
}

export async function GET() {
  const { site } = getSiteConfig();
  const posts = getAllBlogPosts();

  const items = posts
    .map(post => {
      const link = `${site.url}/blog/${post.slug}`;
      const pubDate = new Date(post.frontmatter.publishedAt).toUTCString();
      const categories = post.frontmatter.tags
        .map(t => `      <category>${escapeXml(t)}</category>`)
        .join('\n');
      return [
        '    <item>',
        `      <title>${escapeXml(post.frontmatter.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(post.frontmatter.summary)}</description>`,
        categories,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(site.title)} \u2013 Blog</title>`,
    `    <link>${site.url}/blog</link>`,
    `    <description>Blog posts by ${escapeXml(site.title)}</description>`,
    '    <language>en</language>',
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
