import { redirect } from 'next/navigation';

interface AdminIndexPageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminIndexPage({ params }: AdminIndexPageProps) {
  const { lang } = await params;
  redirect(`/${lang}/content`);
}
