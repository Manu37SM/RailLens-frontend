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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-3xl font-bold tracking-tight text-slate-900">
            {stationCode}
          </div>

          <p className="mt-1 text-lg text-slate-600">{stationName}</p>
        </div>

        <FavoriteButton
          favorite={{
            type: 'station',
            stationCode,
            stationName,
          }}
        />
      </div>

      <div className="mt-5 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
        {totalTrains} train{totalTrains !== 1 ? 's' : ''} stop here
      </div>
    </div>
  );
}
