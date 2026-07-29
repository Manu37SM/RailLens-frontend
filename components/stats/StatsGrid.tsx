import Link from 'next/link';
import {
  Gauge,
  MapPinned,
  Route,
  Timer,
  TrainFront,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import Card from '@/components/layout/Card';
import { StationTrafficProjection, StatsResponse, TrainSpeedProjection } from '@/types/stats';

function BigNumberCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrainFront;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/15">
        <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value.toLocaleString()}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </Card>
  );
}

function RankedStationList({
  title,
  icon: Icon,
  iconClassName,
  stations,
}: {
  title: string;
  icon: typeof Route;
  iconClassName: string;
  stations: StationTrafficProjection[];
}) {
  if (stations.length === 0) return null;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden="true" />
        {title}
      </div>

      <ol className="space-y-2">
        {stations.map((station, index) => (
          <li key={station.stationCode} className="flex items-center gap-3 text-sm">
            <span className="w-4 shrink-0 text-slate-400 dark:text-slate-500">{index + 1}</span>
            <Link
              href={`/stations/${station.stationCode}`}
              className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {station.stationCode} · {station.stationName}
            </Link>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {station.trainCount.toLocaleString()} trains
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function RankedTrainSpeedList({
  title,
  icon: Icon,
  iconClassName,
  trains,
}: {
  title: string;
  icon: typeof Gauge;
  iconClassName: string;
  trains: TrainSpeedProjection[];
}) {
  if (trains.length === 0) return null;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden="true" />
        {title}
      </div>

      <ol className="space-y-2">
        {trains.map((train, index) => (
          <li key={train.trainNumber} className="flex items-center gap-3 text-sm">
            <span className="w-4 shrink-0 text-slate-400 dark:text-slate-500">{index + 1}</span>
            <Link
              href={`/trains/${train.trainNumber}`}
              className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {train.trainNumber} · {train.trainName}
            </Link>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {train.averageSpeedKmh.toLocaleString()} km/h
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function StatsGrid({ stats }: { stats: StatsResponse }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <BigNumberCard icon={TrainFront} label="Trains in the database" value={stats.totalTrains} />
        <BigNumberCard icon={MapPinned} label="Stations in the database" value={stats.totalStations} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.longestRoute && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
              Longest route
            </div>
            <Link
              href={`/trains/${stats.longestRoute.trainNumber}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {stats.longestRoute.trainNumber} · {stats.longestRoute.trainName}
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {stats.longestRoute.distanceKm.toLocaleString()} km
            </p>
          </Card>
        )}

        {stats.shortestRoute && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <TrendingDown className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Shortest route
            </div>
            <Link
              href={`/trains/${stats.shortestRoute.trainNumber}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {stats.shortestRoute.trainNumber} · {stats.shortestRoute.trainName}
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {stats.shortestRoute.distanceKm.toLocaleString()} km
            </p>
          </Card>
        )}

        {stats.busiestStation && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Route className="h-4 w-4 text-purple-600" aria-hidden="true" />
              Busiest station
            </div>
            <Link
              href={`/stations/${stats.busiestStation.stationCode}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {stats.busiestStation.stationCode} · {stats.busiestStation.stationName}
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {stats.busiestStation.trainCount.toLocaleString()} trains
            </p>
          </Card>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RankedStationList
          title="Busiest stations"
          icon={Route}
          iconClassName="text-purple-600"
          stations={stats.busiestStations}
        />

        <RankedTrainSpeedList
          title="Fastest trains"
          icon={Gauge}
          iconClassName="text-green-600"
          trains={stats.fastestTrains}
        />

        <RankedTrainSpeedList
          title="Slowest trains"
          icon={Timer}
          iconClassName="text-blue-600"
          trains={stats.slowestTrains}
        />
      </div>
    </div>
  );
}
