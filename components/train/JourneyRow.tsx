import { RouteStopResponse } from '@/types/train';
import Link from 'next/link';
interface JourneyRowProps {
  stop: RouteStopResponse;
  selectMode?: boolean;
  selectionRole?: 'board' | 'deboard' | null;
  onSelect?: (stop: RouteStopResponse) => void;
}
export default function JourneyRow({
  stop,
  selectMode = false,
  selectionRole = null,
  onSelect,
}: JourneyRowProps) {
  const rowClasses = [
    'grid grid-cols-[36px_1fr_60px_60px] sm:grid-cols-[48px_1fr_80px_80px_56px_70px] print:grid-cols-[48px_1fr_80px_80px_56px_70px] items-center border-b border-slate-200 dark:border-slate-700 px-5 py-2 transition-colors',
    selectMode
      ? 'cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-500/10'
      : 'hover:bg-slate-50 dark:hover:bg-slate-800',
    selectionRole ? 'bg-orange-50 dark:bg-orange-500/15' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={rowClasses}
      role={selectMode ? 'button' : undefined}
      tabIndex={selectMode ? 0 : undefined}
      onClick={selectMode ? () => onSelect?.(stop) : undefined}
      onKeyDown={
        selectMode
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(stop);
              }
            }
          : undefined
      }
      aria-pressed={selectMode ? selectionRole != null : undefined}
    >
      <div className="flex flex-col items-center self-stretch">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
            stop.origin
              ? 'border-green-600 bg-green-600 text-white'
              : stop.destination
                ? 'border-red-600 bg-red-600 text-white'
                : selectionRole
                  ? 'border-orange-600 bg-orange-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          {stop.sequenceNo}
        </div>

        {!stop.destination && (
          <div className="mt-0.5 w-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {selectMode ? (
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-wide text-slate-900 dark:text-slate-100">
                {stop.stationCode}
              </h2>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {stop.stationName}
              </p>
            </div>
          ) : (
            <Link
              href={`/stations/${stop.stationCode}`}
              className="group min-w-0"
            >
              <h2 className="text-base font-semibold tracking-wide text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100">
                {stop.stationCode}
              </h2>

              <p className="mt-0.5 truncate text-xs text-slate-500 group-hover:text-blue-500 dark:text-slate-400">
                {stop.stationName}
              </p>
            </Link>
          )}

          {stop.origin && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
              Origin
            </span>
          )}

          {stop.destination && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
              Destination
            </span>
          )}

          {selectionRole === 'board' && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
              Board here
            </span>
          )}

          {selectionRole === 'deboard' && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
              Get off here
            </span>
          )}
        </div>

        {!stop.origin && !stop.destination && stop.haltMinutes > 0 && (
          <span className="mt-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            Halt {stop.haltMinutes}m
          </span>
        )}
      </div>

      <div className="text-center">
        <p className="font-mono text-[15px] font-semibold">
          {stop.arrivalTime?.slice(0, 5) ?? '--'}
        </p>
      </div>

      <div className="text-center">
        <p className="font-mono text-[15px] font-semibold">
          {stop.departureTime?.slice(0, 5) ?? '--'}
        </p>
      </div>

      <div className="hidden justify-center sm:flex print:flex">
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          D{stop.journeyDay}
        </span>
      </div>

      <div className="hidden text-right sm:block print:block">
        <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
          {stop.distance ?? '--'}
        </p>
      </div>
    </div>
  );
}
