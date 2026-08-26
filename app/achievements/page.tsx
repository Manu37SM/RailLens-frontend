import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ErrorState from '@/components/common/ErrorState';
import AchievementsGrid from '@/components/achievements/AchievementsGrid';
import { getAchievements } from '@/services/statsService';
import { ApiError } from '@/services/api';
export const metadata: Metadata = {
  title: 'Achievements | RailLens',
  description:
    'RailLens railway achievements - top 100 longest and fastest trains, mega routes, super express rankings, rare routes, and hidden gems.',
};
export default async function AchievementsPage() {
  let achievementsError: string | null = null;
  let achievements;
  try {
    achievements = await getAchievements();
  } catch (err) {
    achievementsError =
      err instanceof ApiError ? err.message : 'Failed to load achievements.';
  }
  return (
    <div className="bg-slate-50 py-6 dark:bg-slate-800">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Achievements' }]}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Achievements
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Top 100 lists and derived awards, computed entirely from the
            dataset.
          </p>
        </div>

        {achievements ? (
          <AchievementsGrid achievements={achievements} />
        ) : (
          <ErrorState
            message={achievementsError ?? 'Failed to load achievements.'}
          />
        )}
      </Container>
    </div>
  );
}
