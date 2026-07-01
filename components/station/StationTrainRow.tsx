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
      className="block border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrainFront className="h-4 w-4 text-blue-600" />

            <span className="font-semibold text-slate-900">
              {train.trainNumber}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-600">{train.trainName}</p>
        </div>

        <div className="text-right text-sm">
          <div>
            <span className="text-slate-500">Arr</span>{' '}
            <span className="font-medium">{train.arrivalTime ?? '--'}</span>
          </div>

          <div>
            <span className="text-slate-500">Dep</span>{' '}
            <span className="font-medium">{train.departureTime ?? '--'}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-slate-100 px-2 py-1">
          {train.distance} km
        </span>

        {train.origin && (
          <span className="rounded bg-green-100 px-2 py-1 text-green-700">
            Origin
          </span>
        )}

        {train.destination && (
          <span className="rounded bg-red-100 px-2 py-1 text-red-700">
            Destination
          </span>
        )}
      </div>
    </Link>
  );
}
