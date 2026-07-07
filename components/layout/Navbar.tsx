import Link from 'next/link';
import { TrainFront } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-border/80 sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl text-white">
            <TrainFront size={20} />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">RailLens</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hover:text-primary text-sm font-medium text-slate-600 transition-colors"
          >
            Home
          </Link>
        </div>
      </nav>
    </header>
  );
}
