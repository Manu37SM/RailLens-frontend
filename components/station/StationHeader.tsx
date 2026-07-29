import FavoriteButton from '@/components/common/FavoriteButton';

interface StationHeaderProps {
  stationCode: string;
  stationName: string;
  totalTrains: number;
}

export default function StationHeader({
  stationCode,
  stationName,
  totalTrains,
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

        <FavoriteButton
          favorite={{
            type: 'station',
            stationCode,
            stationName,
          }}
        />
      </div>

      <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
        {totalTrains} train{totalTrains !== 1 ? 's' : ''} stop here
      </div>
    </div>
  );
}
