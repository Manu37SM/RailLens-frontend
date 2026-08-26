import { RouteStopResponse } from '@/types/train';
import { MapPinned } from 'lucide-react';
import ExportCsvButton from '@/components/common/ExportCsvButton';
import PrintButton from '@/components/common/PrintButton';
import { toCsv } from '@/lib/csvExport';
import JourneyRow from './JourneyRow';
import PartialJourneySummary from './PartialJourneySummary';
import StationSearch from './StationSearch';
interface JourneyTableProps {
  trainNumber: string;
  trainName: string;
  route: RouteStopResponse[];
  search: string;
  onSearch: (value: string) => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  boardStop: RouteStopResponse | null;
  deboardStop: RouteStopResponse | null;
  onSelectStop: (stop: RouteStopResponse) => void;
  onClearSelection: () => void;
}
export default function JourneyTable({
  trainNumber,
  trainName,
  route,
  search,
  onSearch,
  selectMode,
  onToggleSelectMode,
  boardStop,
  deboardStop,
  onSelectStop,
  onClearSelection,
}: JourneyTableProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Journey Timetable
        </h2>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <PrintButton />

          <ExportCsvButton
            filename={`${trainNumber}_timetable`}
            label="Export"
            csv={toCsv(route, [
              { key: 'sequenceNo', header: 'Seq' },
              { key: 'stationCode', header: 'Station Code' },
              { key: 'stationName', header: 'Station Name' },
              { key: 'arrivalTime', header: 'Arrival' },
              { key: 'departureTime', header: 'Departure' },
              { key: 'haltMinutes', header: 'Halt (min)' },
              { key: 'journeyDay', header: 'Day' },
              { key: 'distance', header: 'Distance (km)' },
            ])}
          />

          <button
            type="button"
            onClick={onToggleSelectMode}
            aria-pressed={selectMode}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              selectMode
                ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/50 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />

            {!selectMode
              ? 'Plan a partial journey'
              : boardStop && deboardStop
                ? 'Segment selected'
                : 'Selecting stops...'}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 print:hidden">
        <StationSearch value={search} onChange={onSearch} />
      </div>

      {selectMode && !boardStop && (
        <p className="border-b border-slate-200 bg-slate-50 px-5 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 print:hidden">
          Tap where you&apos;ll board.
        </p>
      )}

      {selectMode && boardStop && !deboardStop && (
        <p className="border-b border-slate-200 bg-slate-50 px-5 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 print:hidden">
          Now tap where you&apos;ll get off.
        </p>
      )}

      {boardStop && deboardStop && (
        <PartialJourneySummary
          trainNumber={trainNumber}
          trainName={trainName}
          boarding={boardStop}
          deboarding={deboardStop}
          onClear={onClearSelection}
        />
      )}

      <div className="sticky top-0 z-10 grid grid-cols-[36px_1fr_60px_60px] items-center bg-slate-50 px-5 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:grid-cols-[48px_1fr_80px_80px_56px_70px] dark:bg-slate-800 dark:text-slate-400 print:static print:grid-cols-[48px_1fr_80px_80px_56px_70px]">
        <div />

        <div>Station</div>

        <div className="text-center">Arrival</div>

        <div className="text-center">Departure</div>

        <div className="hidden text-center sm:block print:block">Day</div>

        <div className="hidden text-right sm:block print:block">Km</div>
      </div>

      <div className="relative overflow-x-hidden">
        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-slate-200 dark:bg-slate-700" />

        {route.map((stop) => (
          <JourneyRow
            key={stop.sequenceNo}
            stop={stop}
            selectMode={selectMode}
            selectionRole={
              boardStop?.sequenceNo === stop.sequenceNo
                ? 'board'
                : deboardStop?.sequenceNo === stop.sequenceNo
                  ? 'deboard'
                  : null
            }
            onSelect={onSelectStop}
          />
        ))}
      </div>
    </section>
  );
}
