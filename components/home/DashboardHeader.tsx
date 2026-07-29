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
    <section className="border-b bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950">
      <Container>
        <div className="py-10 lg:py-12">
          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            👋 {getGreeting()}
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">RailLens</h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 dark:text-slate-300">
            Your personal railway dashboard for searching trains, exploring
            stations and continuing your journeys.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2.5">
                  <Heart className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <div className="text-2xl font-bold">{favorites.length}</div>

                  <div className="text-sm text-gray-500 dark:text-slate-400">Favorites</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2.5">
                  <Clock3 className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <div className="text-2xl font-bold">
                    {recentSearches.length}
                  </div>

                  <div className="text-sm text-gray-500 dark:text-slate-400">Recent Searches</div>
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
              className="inline-flex items-center gap-2 rounded-lg border bg-white dark:bg-slate-900 px-5 py-3 font-medium transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <Route className="h-5 w-5" />
              Plan Journey
            </Link>

            <Link
              href="/stations"
              className="inline-flex items-center gap-2 rounded-lg border bg-white dark:bg-slate-900 px-5 py-3 font-medium transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
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
