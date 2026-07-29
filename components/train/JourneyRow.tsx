import { RouteStopResponse } from '@/types/train';
import Link from 'next/link';

interface JourneyRowProps {
  stop: RouteStopResponse;
}

export default function JourneyRow({ stop }: JourneyRowProps) {
  return (
    <div className="grid grid-cols-[48px_1fr_80px_80px_56px_70px] items-center border-b border-slate-200 dark:border-slate-700 px-5 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
      {/* Timeline */}

      <div className="flex flex-col items-center self-stretch">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
            stop.origin
              ? 'border-green-600 bg-green-600 text-white'
              : stop.destination
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
          }`}
        >
          {stop.sequenceNo}
        </div>

        {!stop.destination && (
          <div className="mt-0.5 w-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />
        )}
      </div>

      {/* Station */}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/stations/${stop.stationCode}`}
            className="group min-w-0"
          >
            <h2 className="text-base font-semibold tracking-wide text-slate-900 dark:text-slate-100 transition-colors group-hover:text-blue-600">
              {stop.stationCode}
            </h2>

            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-500">
              {stop.stationName}
            </p>
          </Link>

          {stop.origin && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              Origin
            </span>
          )}

          {stop.destination && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              Destination
            </span>
          )}
        </div>

        {!stop.origin && !stop.destination && stop.haltMinutes > 0 && (
          <span className="mt-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            Halt {stop.haltMinutes}m
          </span>
        )}
      </div>

      {/* Arrival */}

      <div className="text-center">
        <p className="font-mono text-[15px] font-semibold">
          {stop.arrivalTime?.slice(0, 5) ?? '--'}
        </p>
      </div>

      {/* Departure */}

      <div className="text-center">
        <p className="font-mono text-[15px] font-semibold">
          {stop.departureTime?.slice(0, 5) ?? '--'}
        </p>
      </div>

      {/* Journey Day */}

      <div className="flex justify-center">
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
          D{stop.journeyDay}
        </span>
      </div>

      {/* Distance */}

      <div className="text-right">
        <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
          {stop.distance ?? '--'}
        </p>
      </div>
    </div>
  );
}
