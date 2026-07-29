import type { MetadataRoute } from 'next'
import { getAllBlogPosts, getAllProjects, getAllExperience } from '@/lib/mdx'
import { getSiteConfig } from '@/lib/config'

const PUBLIC_LOCALE_PREFIX = '/en'

export default function sitemap(): MetadataRoute.Sitemap {
  const { site } = getSiteConfig()
  const baseUrl = site.url

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/experience`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/skills`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/resume`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
  ]

  const blogPosts: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const projects: MetadataRoute.Sitemap = getAllProjects().map((project) => ({
    url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const experiences: MetadataRoute.Sitemap = getAllExperience().map((exp) => ({
    url: `${baseUrl}${PUBLIC_LOCALE_PREFIX}/experience/${exp.slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogPosts, ...projects, ...experiences]
}
