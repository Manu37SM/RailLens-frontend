import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ErrorState from '@/components/common/ErrorState';
import FunFactsGrid from '@/components/funstats/FunFactsGrid';
import { getFunStats } from '@/services/statsService';
import { ApiError } from '@/services/api';
// Rendered on request (not at build time): a build while the backend slept used to bake "Unable to reach the
// server" into the page until the next deploy. The data itself is cached for an hour (services/api.ts datasetFetch).
export const dynamic = 'force-dynamic';
// Room for a sleeping backend to wake up (the fetch waits up to 50 s).
export const maxDuration = 60;
export const metadata: Metadata = {
  title: 'Fun Facts | RailLens',
  description:
    'Station name trivia and route curiosities, computed entirely from the RailLens dataset.',
};
export default async function FunFactsPage() {
  let funStatsError: string | null = null;
  let errorStatus: number | undefined;
  let funStats;
  try {
    funStats = await getFunStats();
  } catch (err) {
    errorStatus = err instanceof ApiError ? err.status : 0;
    funStatsError =
      err instanceof ApiError ? err.message : 'Failed to load fun facts.';
  }
  return (
    <div className="bg-slate-50 py-6 dark:bg-slate-800">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Fun Facts' }]}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Fun Facts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Station name trivia and route curiosities - not serious statistics,
            just fun ones.
          </p>
        </div>

        {funStats ? (
          <FunFactsGrid funStats={funStats} />
        ) : (
          <ErrorState
            status={errorStatus}
            message={funStatsError ?? 'Failed to load fun facts.'}
          />
        )}
      </Container>
    </div>
  );
}
