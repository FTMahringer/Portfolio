import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface SiteConfig {
  site: {
    title: string
    tagline: string
    url: string
    email: string
    location: string
    avatar: string
    bio: string
  }
  social: {
    github: string
    linkedin: string
    twitter: string
    instagram: string
    youtube: string
    email: string
  }
  contact: {
    resend_from: string
    to: string
  }
  giscus: {
    enabled: boolean
    repo: string
    repoId: string
    category: string
    categoryId: string
    mapping: string
    reactionsEnabled: boolean
    emitMetadata: boolean
    inputPosition: string
    theme: string
    lang: string
  }
  analytics?: {
    provider: 'umami' | 'plausible' | 'none'
    umami?: {
      enabled: boolean
      websiteId: string
      scriptUrl: string
    }
    plausible?: {
      enabled: boolean
      domain: string
      scriptUrl: string
    }
  }
  sidebar_skills?: { category: string; items: string[] }[]
}

let _config: SiteConfig | null = null

export function getSiteConfig(): SiteConfig {
  if (!_config) {
    const filePath = path.join(process.cwd(), 'config', 'site.yaml')
    const raw = fs.readFileSync(filePath, 'utf8')
    _config = yaml.load(raw) as SiteConfig
  }
  return _config
}
