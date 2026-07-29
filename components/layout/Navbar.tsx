import Link from 'next/link';
import { TrainFront } from 'lucide-react';

import ThemeToggle from '@/components/theme/ThemeToggle';

export default function Navbar() {
  return (
    <header className="border-border/80 sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="focus-visible:ring-primary flex items-center gap-2 rounded-md transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl text-white">
            <TrainFront size={20} aria-hidden="true" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">RailLens</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="hover:text-primary focus-visible:ring-primary rounded-md text-sm font-medium text-slate-600 transition-colors focus-visible:ring-2 focus-visible:outline-none dark:text-slate-300"
          >
            Home
          </Link>

          <Link
            href="/history"
            className="hover:text-primary focus-visible:ring-primary rounded-md text-sm font-medium text-slate-600 transition-colors focus-visible:ring-2 focus-visible:outline-none dark:text-slate-300"
          >
            History
          </Link>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
