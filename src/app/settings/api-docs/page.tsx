import { OPENAPI_SPEC } from '@/lib/openapi'
import ApiDocsClient from './ApiDocsClient'

export const metadata = { title: 'API Docs | Dev' }

export default function DevApiDocsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-0.5">API Documentation</h1>
        <p className="text-sm text-[var(--muted)]">Interactive OpenAPI reference for the portfolio API.</p>
      </div>
      <ApiDocsClient spec={OPENAPI_SPEC} embedded />
    </div>
  )
}
