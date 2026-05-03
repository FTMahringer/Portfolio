import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SettingsProvider } from "@/context/SettingsContext";
import { DevProvider } from "@/context/DevContext";
import { SearchProvider } from "@/context/SearchContext";
import { SettingsDrawer } from "@/components/settings/SettingsDrawer";
import { SearchModal } from "@/components/search/SearchModal";
import { ReadingProgress } from "@/components/ui/ReadingProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Fynn M. – Software Developer",
    template: "%s | Fynn M.",
  },
  description:
    "Personal portfolio of Fynn M. – Software Developer & Systems Engineer. Projects, experience, and blog.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fynn M.",
    title: "Fynn M. – Software Developer",
    description:
      "Personal portfolio of Fynn M. – Software Developer & Systems Engineer.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
        <SettingsProvider>
          <DevProvider>
            <SearchProvider>
              <Header />
              <ReadingProgress />
              <div className="flex-1">{children}</div>
              <Footer />
              <SettingsDrawer />
              <SearchModal />
            </SearchProvider>
          </DevProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
