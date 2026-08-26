import { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ErrorState from '@/components/common/ErrorState';
import RankingsGrid from '@/components/rankings/RankingsGrid';
import { getRankings } from '@/services/statsService';
import { ApiError } from '@/services/api';
export const metadata: Metadata = {
  title: 'Rankings | RailLens',
  description:
    'RailLens leaderboards - most and fewest halts, longest and shortest halt durations, and the most popular and connected stations.',
};
export default async function RankingsPage() {
  let rankingsError: string | null = null;
  let rankings;
  try {
    rankings = await getRankings();
  } catch (err) {
    rankingsError =
      err instanceof ApiError ? err.message : 'Failed to load rankings.';
  }
  return (
    <div className="bg-slate-50 py-6 dark:bg-slate-800">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Rankings' }]}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Rankings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Leaderboards computed entirely from the dataset. See{' '}
            <Link
              href="/achievements"
              className="text-orange-600 hover:underline"
            >
              Achievements
            </Link>{' '}
            for top-100 lists and derived awards.
          </p>
        </div>

        {rankings ? (
          <RankingsGrid rankings={rankings} />
        ) : (
          <ErrorState message={rankingsError ?? 'Failed to load rankings.'} />
        )}
      </Container>
    </div>
  );
}
