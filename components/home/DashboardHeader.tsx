'use client';

import Link from 'next/link';
import { Heart, Clock3, TrainFront, Route, MapPinned } from 'lucide-react';

import Container from '@/components/layout/Container';

import { useFavorites } from '@/stores/favoritesStore';
import { useRecentSearches } from '@/stores/recentSearchStore';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';

  return 'Good Night';
}

export default function DashboardHeader() {
  const favorites = useFavorites();
  const recentSearches = useRecentSearches();

  return (
    // Background/text here deliberately use the CSS-variable-driven tokens
    // from globals.css (bg-background/text-foreground/text-muted/bg-card)
    // instead of ad-hoc `dark:` color-stop overrides on a multi-stop
    // gradient. The previous version paired a `from/via/to` gradient with
    // matching `dark:from/via/to` overrides plus separate `dark:text-*`
    // overrides on the title/subtitle - in practice the gradient's dark
    // stops rendered inconsistently with the rest of the page (title/body
    // text staying at light-mode contrast against a light-mode-ish
    // background while sibling elements switched correctly), producing the
    // washed-out, barely-legible hero seen in dark mode. Tokens avoid the
    // whole failure class: --background/--foreground/--muted/--card already
    // flip correctly under `.dark` (proven by <body>, Navbar, and every
    // card that already uses them), so there is nothing left to get out of
    // sync. The radial tint keeps the brand accent without needing its own
    // dark: variant, since it's colored via `--primary`, which itself is
    // theme-aware.
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at top right, color-mix(in srgb, var(--primary) 12%, transparent), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <Container>
        <div className="relative py-10 lg:py-12">
          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            👋 {getGreeting()}
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground">RailLens</h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Your personal railway dashboard for searching trains, exploring
            stations and continuing your journeys.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-500/15">
                  <Heart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>

                <div>
                  <div className="text-2xl font-bold text-foreground">{favorites.length}</div>

                  <div className="text-sm text-muted">Favorites</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-500/15">
                  <Clock3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>

                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {recentSearches.length}
                  </div>

                  <div className="text-sm text-muted">Recent Searches</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/trains"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-medium text-white transition-colors hover:bg-orange-700"
            >
              <TrainFront className="h-5 w-5" />
              Search Trains
            </Link>

            <Link
              href="/journeys"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 font-medium text-foreground transition-colors hover:bg-orange-50 dark:hover:bg-slate-800"
            >
              <Route className="h-5 w-5" />
              Plan Journey
            </Link>

            <Link
              href="/stations"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 font-medium text-foreground transition-colors hover:bg-orange-50 dark:hover:bg-slate-800"
            >
              <MapPinned className="h-5 w-5" />
              Explore Stations
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
