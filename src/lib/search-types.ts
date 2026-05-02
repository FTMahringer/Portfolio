export interface SearchItem {
  id: string
  type: 'blog' | 'project' | 'experience'
  title: string
  summary?: string
  company?: string
  tags?: string[]
  stack?: string[]
  href: string
}
