import Link from 'next/link';
import { ArrowRight, Clock3, MapPinned, TrainFront } from 'lucide-react';

import Card from '@/components/layout/Card';
import { JourneyTrainResponse } from '@/types/journey';

interface Props {
  train: JourneyTrainResponse;
}

export default function JourneyResultRow({ train }: Props) {
  return (
    <Link href={`/trains/${train.trainNumber}`} className="block">
      <Card className="group px-4 py-3 hover:border-orange-200">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <TrainFront size={18} className="shrink-0 text-orange-600" />

              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {train.trainNumber}
              </span>

              <span className="truncate text-slate-600 dark:text-slate-300">{train.trainName}</span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="text-center">
                <p className="text-xl leading-none font-bold text-slate-900 dark:text-slate-100">
                  {train.departureTime}
                </p>

                <p className="mt-1 text-xs tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                  DEPARTURE
                </p>
              </div>

              <div className="flex flex-1 items-center gap-2">
                <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />

                <ArrowRight
                  size={16}
                  className="text-orange-500 transition-transform duration-200 group-hover:translate-x-1"
                />

                <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
              </div>

              <div className="text-center">
                <p className="text-xl leading-none font-bold text-slate-900 dark:text-slate-100">
                  {train.arrivalTime}
                </p>

                <p className="mt-1 text-xs tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                  ARRIVAL
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex shrink-0 flex-col items-end gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
              <Clock3 size={15} className="text-orange-500" />
              <span>{train.duration}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
              <MapPinned size={15} className="text-orange-500" />
              <span>{train.distance} km</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
