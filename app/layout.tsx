import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import AssistantFab from '@/components/assistant/AssistantFab';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'RailLens',
    template: '%s | RailLens',
  },
  description:
    'A modern railway information system built with Spring Boot, Next.js, and PostgreSQL.',
};

// Runs before hydration so the correct theme class is present on first
// paint - without this, the page would flash light mode for a moment
// before React mounts and applies the user's stored/system preference.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('raillens-theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
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
      </body>
    </html>
  );
}
