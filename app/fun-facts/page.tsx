import { Metadata } from 'next';

import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ErrorState from '@/components/common/ErrorState';
import FunFactsGrid from '@/components/funstats/FunFactsGrid';
import { getFunStats } from '@/services/statsService';
import { ApiError } from '@/services/api';

export const metadata: Metadata = {
  title: 'Fun Facts | RailLens',
  description: 'Station name trivia and route curiosities, computed entirely from the RailLens dataset.',
};

export default async function FunFactsPage() {
  let funStatsError: string | null = null;
  let funStats;

  try {
    funStats = await getFunStats();
  } catch (err) {
    funStatsError = err instanceof ApiError ? err.message : 'Failed to load fun facts.';
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-6">
      <Container>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Fun Facts' }]} />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Fun Facts</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Station name trivia and route curiosities - not serious statistics, just fun ones.
          </p>
        </div>

        {funStats ? (
          <FunFactsGrid funStats={funStats} />
        ) : (
          <ErrorState message={funStatsError ?? 'Failed to load fun facts.'} />
        )}
      </Container>
    </div>
  );
}
