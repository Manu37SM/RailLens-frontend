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
    <section className="border-border bg-background relative overflow-hidden border-b">
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

          <h1 className="text-foreground mt-5 text-4xl font-bold tracking-tight">
            RailLens
          </h1>

          <p className="text-muted mt-4 max-w-2xl text-base leading-7">
            Your personal railway dashboard for searching trains, exploring
            stations and continuing your journeys.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border-border bg-card rounded-lg border p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-500/15">
                  <Heart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>

                <div>
                  <div className="text-foreground text-2xl font-bold">
                    {favorites.length}
                  </div>

                  <div className="text-muted text-sm">Favorites</div>
                </div>
              </div>
            </div>

            <div className="border-border bg-card rounded-lg border p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-500/15">
                  <Clock3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>

                <div>
                  <div className="text-foreground text-2xl font-bold">
                    {recentSearches.length}
                  </div>

                  <div className="text-muted text-sm">Recent Searches</div>
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
              className="border-border bg-card text-foreground inline-flex items-center gap-2 rounded-lg border px-5 py-3 font-medium transition-colors hover:bg-orange-50 dark:hover:bg-slate-800"
            >
              <Route className="h-5 w-5" />
              Plan Journey
            </Link>

            <Link
              href="/stations"
              className="border-border bg-card text-foreground inline-flex items-center gap-2 rounded-lg border px-5 py-3 font-medium transition-colors hover:bg-orange-50 dark:hover:bg-slate-800"
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
