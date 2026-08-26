import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AssistantFab from '@/components/assistant/AssistantFab';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import GlobalSearchShortcut from '@/components/common/GlobalSearchShortcut';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RailLens - Indian Railway Train & Station Search',
    template: '%s | RailLens',
  },
  description:
    'Search Indian Railways trains and stations, plan journeys between stations, and view live schedules - free, fast and open.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RailLens',
  },
};
export const viewport: Viewport = {
  themeColor: '#2563eb',
  colorScheme: 'light dark',
};
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('raillens-theme');
    var dark = stored === 'dark'
      ? true
      : stored === 'light'
        ? false
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-background text-foreground flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="bg-primary focus:ring-primary sr-only rounded-md px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:ring-2 focus:outline-none"
        >
          Skip to main content
        </a>

        <Navbar />

        <main id="main-content" className="flex-1">
          {children} <AssistantFab />
        </main>

        <Footer />

        <ServiceWorkerRegister />
        <GlobalSearchShortcut />
      </body>
    </html>
  );
}
