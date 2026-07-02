import Link from 'next/link';

import Card from '@/components/layout/Card';
import { JourneyTrainResponse } from '@/types/journey';

interface Props {
  train: JourneyTrainResponse;
}

export default function JourneyResultRow({ train }: Props) {
  return (
    <Link href={`/trains/${train.trainNumber}`} className="block">
      <Card className="p-5 transition-colors hover:bg-slate-50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{train.trainNumber}</h3>

            <p className="text-sm text-slate-600">{train.trainName}</p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
            {train.duration}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-center">
            <p className="text-xl font-semibold">{train.departureTime}</p>
            <p className="text-xs text-slate-500">Departure</p>
          </div>

          <div className="mx-6 flex-1 border-t border-slate-300" />

          <div className="text-center">
            <p className="text-xl font-semibold">{train.arrivalTime}</p>
            <p className="text-xs text-slate-500">Arrival</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>{train.distance} km</span>
          <span>View details →</span>
        </div>
      </Card>
    </Link>
  );
}
