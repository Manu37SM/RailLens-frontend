import Link from 'next/link';
import { Award, Gem, Mountain, Rocket, Sparkle, Zap } from 'lucide-react';
import Card from '@/components/layout/Card';
import { AchievementsResponse } from '@/types/achievements';
function Leaderboard<T>({
  title,
  icon: Icon,
  iconClassName,
  items,
  keyOf,
  hrefOf,
  primaryOf,
  valueOf,
}: {
  title: string;
  icon: typeof Award;
  iconClassName: string;
  items: T[];
  keyOf: (item: T) => string;
  hrefOf: (item: T) => string;
  primaryOf: (item: T) => string;
  valueOf: (item: T) => string;
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden="true" />
        {title}
      </div>

      <ol className="space-y-2">
        {items.slice(0, 10).map((item, index) => (
          <li key={keyOf(item)} className="flex items-center gap-3 text-sm">
            <span className="w-4 shrink-0 text-slate-400 dark:text-slate-500">
              {index + 1}
            </span>
            <Link
              href={hrefOf(item)}
              className="min-w-0 flex-1 truncate font-medium text-slate-900 hover:text-orange-600 dark:text-slate-100"
            >
              {primaryOf(item)}
            </Link>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {valueOf(item)}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
export default function AchievementsGrid({
  achievements,
}: {
  achievements: AchievementsResponse;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Leaderboard
        title="Longest routes (top 100)"
        icon={Mountain}
        iconClassName="text-purple-600"
        items={achievements.longestRoutes}
        keyOf={(r) => r.trainNumber}
        hrefOf={(r) => `/trains/${r.trainNumber}`}
        primaryOf={(r) => `${r.trainNumber} · ${r.trainName}`}
        valueOf={(r) => `${r.distanceKm.toLocaleString()} km`}
      />

      <Leaderboard
        title="Fastest trains (top 100)"
        icon={Zap}
        iconClassName="text-green-600"
        items={achievements.fastestTrains}
        keyOf={(t) => t.trainNumber}
        hrefOf={(t) => `/trains/${t.trainNumber}`}
        primaryOf={(t) => `${t.trainNumber} · ${t.trainName}`}
        valueOf={(t) => `${t.averageSpeedKmh} km/h`}
      />

      <Leaderboard
        title="Mega routes (>3000 km)"
        icon={Rocket}
        iconClassName="text-orange-600"
        items={achievements.megaRoutes}
        keyOf={(r) => r.trainNumber}
        hrefOf={(r) => `/trains/${r.trainNumber}`}
        primaryOf={(r) => `${r.trainNumber} · ${r.trainName}`}
        valueOf={(r) => `${r.distanceKm.toLocaleString()} km`}
      />

      <Leaderboard
        title="Super express rankings"
        icon={Award}
        iconClassName="text-blue-600"
        items={achievements.superExpressRankings}
        keyOf={(e) => e.trainNumber}
        hrefOf={(e) => `/trains/${e.trainNumber}`}
        primaryOf={(e) => `${e.trainNumber} · ${e.trainName}`}
        valueOf={(e) => `${e.kmPerHalt} km/halt`}
      />

      <Leaderboard
        title="Rare routes"
        icon={Sparkle}
        iconClassName="text-purple-600"
        items={achievements.rareRoutes}
        keyOf={(e) => e.trainNumber}
        hrefOf={(e) => `/trains/${e.trainNumber}`}
        primaryOf={(e) => `${e.trainNumber} · ${e.trainName}`}
        valueOf={(e) => `${e.averageTrainsPerHop} trains/hop`}
      />

      <Leaderboard
        title="Hidden gems"
        icon={Gem}
        iconClassName="text-blue-600"
        items={achievements.hiddenGems}
        keyOf={(e) => e.trainNumber}
        hrefOf={(e) => `/trains/${e.trainNumber}`}
        primaryOf={(e) => `${e.trainNumber} · ${e.trainName}`}
        valueOf={(e) => `${e.distanceKm} km · ${e.averageSpeedKmh} km/h`}
      />
    </div>
  );
}
