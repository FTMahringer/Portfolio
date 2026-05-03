import { BlogPost, getAllBlogPosts } from './mdx';

export function getRelatedPosts(currentSlug: string, tags: string[] = [], limit: number = 3): BlogPost[] {
  const allPosts = getAllBlogPosts();
  
  // Filter out current post
  const otherPosts = allPosts.filter(post => post.slug !== currentSlug);
  
  if (tags.length === 0) {
    // No tags, return recent posts
    return otherPosts.slice(0, limit);
  }
  
  // Score posts by tag overlap
  const scored = otherPosts.map(post => {
    const postTags = post.frontmatter.tags || [];
    const matchCount = postTags.filter(tag => tags.includes(tag)).length;
    return { post, score: matchCount };
  });
  
  // Sort by score (most matches first), then by date (newest first)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.post.frontmatter.publishedAt).getTime() - new Date(a.post.frontmatter.publishedAt).getTime();
  });
  
  // Return posts with at least one matching tag, or fall back to recent posts
  const matched = scored.filter(s => s.score > 0).map(s => s.post);
  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }
  
  // Not enough matches, add some recent posts
  return [...matched, ...otherPosts.slice(0, limit - matched.length)];
}
