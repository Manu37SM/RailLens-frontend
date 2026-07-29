import { StationTrainResponse } from '@/types/station';
import StationTrainRow from './StationTrainRow';

interface Props {
  trains: StationTrainResponse[];
}

export default function StationTrainList({ trains }: Props) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Trains Passing Through
        </h2>
      </div>

      {trains.length === 0 ? (
        <div className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
          No trains found.
        </div>
      ) : (
        trains.map((train) => (
          <StationTrainRow key={train.trainNumber} train={train} />
        ))
      )}
    </div>
  );
}
