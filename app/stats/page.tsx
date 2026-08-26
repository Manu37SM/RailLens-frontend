import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ErrorState from '@/components/common/ErrorState';
import StatsGrid from '@/components/stats/StatsGrid';
import { getStats } from '@/services/statsService';
import { ApiError } from '@/services/api';
export const metadata: Metadata = {
  title: 'Statistics | RailLens',
  description:
    'Dataset statistics for RailLens - total trains and stations, longest and shortest routes, and the busiest station.',
};
export default async function StatsPage() {
  let statsError: string | null = null;
  let stats;
  try {
    stats = await getStats();
  } catch (err) {
    statsError =
      err instanceof ApiError ? err.message : 'Failed to load statistics.';
  }
  return (
    <div className="bg-slate-50 py-6 dark:bg-slate-800">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Statistics' }]}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Statistics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            A look at what&apos;s in the RailLens dataset.
          </p>
        </div>

        {stats ? (
          <StatsGrid stats={stats} />
        ) : (
          <ErrorState message={statsError ?? 'Failed to load statistics.'} />
        )}
      </Container>
    </div>
  );
}
