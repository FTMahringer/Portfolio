import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { NewContentForm } from './NewContentForm'

const ALLOWED = ['blog', 'projects', 'experience'] as const
type ContentType = (typeof ALLOWED)[number]

interface Props {
  params: Promise<{ type: string }>
}

export function generateMetadata() {
  return { title: 'Create Content | Dev' }
}

export default async function DevNewPage({ params }: Props) {
  const { type } = await params

  if (!ALLOWED.includes(type as ContentType)) notFound()

  const cookieStore = await cookies()
  if (cookieStore.get('dev_session')?.value !== '1') {
    redirect('/')
  }

  // Map URL type slug to form type
  const formType = (type === 'projects' ? 'project' : type) as 'blog' | 'project' | 'experience'

  return <NewContentForm type={formType} />
}
