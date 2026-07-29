import Link from 'next/link';
import { TrainFront } from 'lucide-react';

import { StationTrainResponse } from '@/types/station';

interface Props {
  train: StationTrainResponse;
}

export default function StationTrainRow({ train }: Props) {
  return (
    <Link
      href={`/trains/${train.trainNumber}`}
      className="block border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 transition last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrainFront className="h-4 w-4 text-blue-600" />

            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {train.trainNumber}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{train.trainName}</p>
        </div>

        <div className="text-right text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Arr</span>{' '}
            <span className="font-medium">{train.arrivalTime ?? '--'}</span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400">Dep</span>{' '}
            <span className="font-medium">{train.departureTime ?? '--'}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1">
          {train.distance != null ? `${train.distance} km` : 'Distance unavailable'}
        </span>

        {train.origin && (
          <span className="rounded bg-green-100 dark:bg-green-500/15 px-2 py-1 text-green-700 dark:text-green-300">
            Origin
          </span>
        )}

        {train.destination && (
          <span className="rounded bg-red-100 dark:bg-red-500/15 px-2 py-1 text-red-700 dark:text-red-300">
            Destination
          </span>
        )}
      </div>
    </Link>
  );
}
