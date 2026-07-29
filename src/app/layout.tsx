import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { DevProvider } from "@/context/DevContext";
import { SearchProvider } from "@/context/SearchContext";
import { Analytics } from "@/components/analytics/Analytics";
import { getSiteConfig } from "@/lib/config";

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
  const config = getSiteConfig();
  
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
        <SettingsProvider>
          <DevProvider>
            <SearchProvider>
              {children}
            </SearchProvider>
          </DevProvider>
        </SettingsProvider>
        {config.analytics && <Analytics config={config.analytics} />}
      </body>
    </html>
  );
}
