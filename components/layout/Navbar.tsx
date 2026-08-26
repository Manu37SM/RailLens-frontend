import Link from 'next/link';
import {
  Bookmark,
  Clock3,
  Heart,
  MapPin,
  Route,
  TrainFront,
} from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import AuthNavLinks from '@/components/auth/AuthNavLinks';
const navLinkClasses =
  'hover:text-primary focus-visible:ring-primary flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors focus-visible:ring-2 focus-visible:outline-none dark:text-slate-300';
export default function Navbar() {
  return (
    <header className="border-border/80 sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80 print:hidden">
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
          <Link href="/" className={`hidden sm:flex ${navLinkClasses}`}>
            Home
          </Link>

          <Link href="/trains" aria-label="Trains" className={navLinkClasses}>
            <TrainFront size={16} aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              Trains
            </span>
          </Link>

          <Link
            href="/stations"
            aria-label="Stations"
            className={navLinkClasses}
          >
            <MapPin size={16} aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              Stations
            </span>
          </Link>

          <Link
            href="/journeys"
            aria-label="Journeys"
            className={navLinkClasses}
          >
            <Route size={16} aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              Journeys
            </span>
          </Link>

          <Link
            href="/favorites"
            aria-label="Favorites"
            className={navLinkClasses}
          >
            <Heart size={16} aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              Favorites
            </span>
          </Link>

          <Link href="/history" aria-label="History" className={navLinkClasses}>
            <Clock3 size={16} aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              History
            </span>
          </Link>

          <Link
            href="/saved-journeys"
            aria-label="Saved Journeys"
            className={navLinkClasses}
          >
            <Bookmark size={16} aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              Saved
            </span>
          </Link>

          <AuthNavLinks />

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
