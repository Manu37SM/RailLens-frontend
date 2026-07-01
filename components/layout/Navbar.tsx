import Link from "next/link";
import { TrainFront } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <TrainFront size={20} />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              RailLens
            </span>
            <span className="text-xs text-muted">
              Indian Railway Information
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            Home
          </Link>
        </div>
      </nav>
    </header>
  );
}