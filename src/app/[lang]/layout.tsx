import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { getTranslations } from "@/lib/i18n";
import { LOCALES, isLocaleCode } from "@/lib/locale-registry";
import { TranslationProvider } from "@/context/TranslationContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";
import { SearchModal } from "@/components/search/SearchModal";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { PageTransition } from "@/components/layout/PageTransition";
import { ToolbarLayout } from "@/components/admin/ToolbarLayout";
import AdminToolbar from "@/components/admin/AdminToolbar";
import EditContentButton from "@/components/admin/EditContentButton";

export function generateStaticParams() {
  return Object.keys(LOCALES).map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  if (!isLocaleCode(lang)) {
    notFound();
  }

  const translations = await getTranslations(lang);

  return (
    <TranslationProvider locale={lang} translations={translations}>
      <AdminToolbar />
      <ToolbarLayout>
        <Header />
        <ReadingProgress />
        <PageTransition>
          <div className="flex-1">{children}</div>
        </PageTransition>
        <Footer />
        <EditContentButton />
      </ToolbarLayout>
      <SettingsDrawer />
      <SearchModal />
    </TranslationProvider>
  );
}
