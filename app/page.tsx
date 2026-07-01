'use client';

import { useState } from 'react';
import { TrainFront } from 'lucide-react';

import Container from '@/components/layout/Container';
import SearchBar from '@/components/train/SearchBar';
import TrainList from '@/components/train/TrainList';
import FeatureCards from '@/components/home/FeatureCards';
import RecentSearches from '@/components/home/RecentSearches';

import { searchTrains } from '@/services/trainService';
import { TrainSearchResponse } from '@/types/train';

export default function Home() {
  const [query, setQuery] = useState('');
  const [trains, setTrains] = useState<TrainSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    try {
      setLoading(true);
      const results = await searchTrains(query);
      setTrains(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <Container>
        <section className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <div className="bg-primary mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-lg">
            <TrainFront size={40} />
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Explore Indian Railways
          </h1>

          <p className="mb-10 max-w-3xl text-lg leading-8 text-slate-600">
            Search trains, explore complete routes, discover station schedules,
            and follow journey timelines—all powered by official railway
            schedule data.
          </p>

          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />
          <RecentSearches />
          <FeatureCards />
        </section>

        {trains.length > 0 && (
          <section className="pb-20">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Search Results
                </h2>

                <p className="mt-1 text-slate-500">
                  {trains.length} train{trains.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            <TrainList trains={trains} />
          </section>
        )}
      </Container>
    </main>
  );
}
