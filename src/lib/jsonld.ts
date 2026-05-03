import { getSiteConfig } from './config'
import type { BlogPost, Project } from './types'

export function personSchema(): Record<string, unknown> {
  const { site, social } = getSiteConfig()

  const sameAs: string[] = []
  if (social.github) sameAs.push(`https://github.com/${social.github}`)
  if (social.linkedin) sameAs.push(`https://www.linkedin.com/in/${social.linkedin}`)
  if (social.twitter) sameAs.push(`https://twitter.com/${social.twitter}`)
  if (social.instagram) sameAs.push(`https://www.instagram.com/${social.instagram}`)
  if (social.youtube) sameAs.push(`https://www.youtube.com/@${social.youtube}`)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.title,
    url: site.url,
    email: site.email,
    description: site.bio,
    ...(sameAs.length > 0 && { sameAs }),
  }
}

export function websiteSchema(): Record<string, unknown> {
  const { site } = getSiteConfig()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.title,
    url: site.url,
    description: site.tagline,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function blogPostSchema(post: BlogPost): Record<string, unknown> {
  const { site } = getSiteConfig()

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.summary,
    datePublished: post.frontmatter.publishedAt,
    url: `${site.url}/blog/${post.slug}`,
    author: {
      '@type': 'Person',
      name: site.title,
      url: site.url,
    },
    ...(post.frontmatter.tags.length > 0 && {
      keywords: post.frontmatter.tags.join(', '),
    }),
    ...(post.frontmatter.image && { image: post.frontmatter.image }),
  }
}

export function softwareSchema(project: Project): Record<string, unknown> {
  const { site } = getSiteConfig()

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.frontmatter.title,
    description: project.frontmatter.summary,
    url: `${site.url}/projects/${project.slug}`,
    programmingLanguage: project.frontmatter.stack,
    author: {
      '@type': 'Person',
      name: site.title,
      url: site.url,
    },
    ...(project.frontmatter.github && { codeRepository: project.frontmatter.github }),
    ...(project.frontmatter.demo && { runtimePlatform: project.frontmatter.demo }),
  }
}
