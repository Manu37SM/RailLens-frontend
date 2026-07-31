import Link from 'next/link';
import { Clock3, Hourglass, Network, Signpost, Timer, TrendingUp } from 'lucide-react';

import Card from '@/components/layout/Card';
import {
  HaltCountEntry,
  HaltDurationEntry,
  RankingsResponse,
  StationCountEntry,
} from '@/types/rankings';

// Defensive cap, same reasoning as AchievementsGrid/SmartSearchClient: these
// lists are meant to be small leaderboards and the backend already limits
// them, but nothing here re-derives that limit - if a backend change or bug
// ever widened one of these to scale with the station/train count instead
// of staying a fixed top-N, this keeps the render bounded rather than
// dumping thousands of rows into the DOM.
const MAX_LIST_ITEMS = 25;

function RankedHaltCountList({
  title,
  icon: Icon,
  iconClassName,
  trains,
}: {
  title: string;
  icon: typeof Hourglass;
  iconClassName: string;
  trains: HaltCountEntry[];
}) {
  if (trains.length === 0) return null;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden="true" />
        {title}
      </div>

      <ol className="space-y-2">
        {trains.slice(0, MAX_LIST_ITEMS).map((train, index) => (
          <li key={train.trainNumber} className="flex items-center gap-3 text-sm">
            <span className="w-4 shrink-0 text-slate-400 dark:text-slate-500">{index + 1}</span>
            <Link
              href={`/trains/${train.trainNumber}`}
              className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {train.trainNumber} · {train.trainName}
            </Link>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {train.haltCount.toLocaleString()} halts
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function RankedHaltDurationList({
  title,
  icon: Icon,
  iconClassName,
  halts,
}: {
  title: string;
  icon: typeof Clock3;
  iconClassName: string;
  halts: HaltDurationEntry[];
}) {
  if (halts.length === 0) return null;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden="true" />
        {title}
      </div>

      <ol className="space-y-2">
        {halts.slice(0, MAX_LIST_ITEMS).map((halt, index) => (
          <li key={`${halt.trainNumber}-${halt.stationCode}`} className="flex items-center gap-3 text-sm">
            <span className="w-4 shrink-0 text-slate-400 dark:text-slate-500">{index + 1}</span>
            <Link
              href={`/trains/${halt.trainNumber}`}
              className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {halt.trainNumber} at {halt.stationCode}
            </Link>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {halt.minutes.toLocaleString()} min
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function RankedStationCountList({
  title,
  icon: Icon,
  iconClassName,
  stations,
  unitLabel,
}: {
  title: string;
  icon: typeof Signpost;
  iconClassName: string;
  stations: StationCountEntry[];
  unitLabel: string;
}) {
  if (stations.length === 0) return null;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden="true" />
        {title}
      </div>

      <ol className="space-y-2">
        {stations.slice(0, MAX_LIST_ITEMS).map((station, index) => (
          <li key={station.stationCode} className="flex items-center gap-3 text-sm">
            <span className="w-4 shrink-0 text-slate-400 dark:text-slate-500">{index + 1}</span>
            <Link
              href={`/stations/${station.stationCode}`}
              className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {station.stationCode} · {station.stationName}
            </Link>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {station.count.toLocaleString()} {unitLabel}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function RankingsGrid({ rankings }: { rankings: RankingsResponse }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RankedHaltCountList
        title="Most halts"
        icon={Hourglass}
        iconClassName="text-orange-600"
        trains={rankings.mostHaltsTrains}
      />

      <RankedHaltCountList
        title="Fewest halts"
        icon={TrendingUp}
        iconClassName="text-green-600"
        trains={rankings.fewestHaltsTrains}
      />

      <RankedHaltDurationList
        title="Longest halts"
        icon={Clock3}
        iconClassName="text-purple-600"
        halts={rankings.longestHalts}
      />

      <RankedHaltDurationList
        title="Shortest halts"
        icon={Timer}
        iconClassName="text-blue-600"
        halts={rankings.shortestHalts}
      />

      <RankedStationCountList
        title="Most popular origin stations"
        icon={Signpost}
        iconClassName="text-orange-600"
        stations={rankings.mostPopularOriginStations}
        unitLabel="origins"
      />

      <RankedStationCountList
        title="Most connected stations"
        icon={Network}
        iconClassName="text-blue-600"
        stations={rankings.mostConnectedStations}
        unitLabel="links"
      />
    </div>
  );
}
