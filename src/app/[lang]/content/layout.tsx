import { requireAdminSession } from '@/lib/session';

export default async function ContentLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return <>{children}</>;
}
