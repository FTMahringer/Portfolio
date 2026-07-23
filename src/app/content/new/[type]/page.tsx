import { notFound } from 'next/navigation'
import { requireAdminSession } from '@/lib/session'
import NewContentForm from './NewContentForm'

const VALID_TYPES = ['blog', 'projects', 'experience'] as const
type ContentType = typeof VALID_TYPES[number]
type FormType = 'blog' | 'project' | 'experience'

export const metadata = { title: 'Create Content | Dev' }

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  if (!VALID_TYPES.includes(type as ContentType)) notFound()
  await requireAdminSession()
  const formType: FormType = type === 'projects' ? 'project' : (type as FormType)
  return <NewContentForm type={formType} />
}