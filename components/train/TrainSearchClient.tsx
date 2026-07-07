'use client';

import { useState } from 'react';

import Container from '@/components/layout/Container';
import SearchBar from '@/components/train/SearchBar';
import TrainList from '@/components/train/TrainList';

import RecentSearchChips from './RecentSearchChips';

import { searchTrains } from '@/services/trainService';
import { TrainSearchResponse } from '@/types/train';

export default function Home() {
  const [query, setQuery] = useState('');
  const [trains, setTrains] = useState<TrainSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(searchQuery: string = query) {
    const trimmed = searchQuery.trim();

    if (!trimmed) return;

    setQuery(trimmed);

    try {
      setLoading(true);

      const results = await searchTrains(trimmed);

      setTrains(results);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <Container>
        <section className="flex flex-col items-center py-8 py-20 text-center">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />
          <RecentSearchChips
            onSelect={(value) => {
              setQuery(value);
              handleSearch(value);
            }}
          />
        </section>

        {trains.length > 0 && (
          <section className="pb-20">
            <div className="mb-4 flex items-center justify-between">
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
