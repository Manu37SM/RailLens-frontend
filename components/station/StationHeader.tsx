import FavoriteButton from '@/components/common/FavoriteButton';
import ShareButton from '@/components/common/ShareButton';

interface StationHeaderProps {
  stationCode: string;
  stationName: string;
  totalTrains: number;
  originatingCount: number;
  terminatingCount: number;
  passingCount: number;
}

export default function StationHeader({
  stationCode,
  stationName,
  totalTrains,
  originatingCount,
  terminatingCount,
  passingCount,
}: StationHeaderProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {stationCode}
          </div>

          <p className="mt-0.5 text-base text-slate-600 dark:text-slate-300">{stationName}</p>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton
            title={`${stationCode} - ${stationName}`}
            text={`${stationName} (${stationCode}) train schedules on RailLens`}
            path={`/stations/${stationCode}`}
          />

          <FavoriteButton
            favorite={{
              type: 'station',
              stationCode,
              stationName,
            }}
          />
        </div>
      </div>

      <div className="mt-3 inline-flex rounded-full bg-blue-50 dark:bg-blue-500/15 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
        {totalTrains} train{totalTrains !== 1 ? 's' : ''} stop here
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          Originating
          <span className="ml-2 font-semibold text-slate-900 dark:text-slate-100">
            {originatingCount}
          </span>
        </span>

        <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          Terminating
          <span className="ml-2 font-semibold text-slate-900 dark:text-slate-100">
            {terminatingCount}
          </span>
        </span>

        <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          Passing Through
          <span className="ml-2 font-semibold text-slate-900 dark:text-slate-100">
            {passingCount}
          </span>
        </span>
      </div>
    </div>
  );
}
