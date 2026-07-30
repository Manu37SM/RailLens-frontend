import { Metadata } from 'next';

import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ErrorState from '@/components/common/ErrorState';
import NetworkStatsGrid from '@/components/network/NetworkStatsGrid';
import { getNetworkStats } from '@/services/networkService';
import { ApiError } from '@/services/api';

export const metadata: Metadata = {
  title: 'Railway Network | RailLens',
  description:
    'Graph analysis of the RailLens station network - connectivity, route density, and the most central stations, computed entirely from the dataset.',
};

export default async function NetworkPage() {
  let statsError: string | null = null;
  let stats;

  try {
    stats = await getNetworkStats();
  } catch (err) {
    statsError = err instanceof ApiError ? err.message : 'Failed to load network statistics.';
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-6">
      <Container>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Railway Network' }]} />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Railway Network</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Every station and train in the dataset, treated as a graph - built and analyzed
            entirely from the schedule data, no external or live sources.
          </p>
        </div>

        {stats ? (
          <NetworkStatsGrid stats={stats} />
        ) : (
          <ErrorState message={statsError ?? 'Failed to load network statistics.'} />
        )}
      </Container>
    </div>
  );
}
