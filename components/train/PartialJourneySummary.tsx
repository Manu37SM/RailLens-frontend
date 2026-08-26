'use client';
import { Bookmark, MapPin, X } from 'lucide-react';
import { RouteStopResponse } from '@/types/train';
import {
  computePartialJourney,
  formatPartialDuration,
} from '@/lib/partialJourney';
import {
  isJourneySaved,
  toggleSavedJourney,
  useSavedJourneys,
} from '@/stores/savedJourneyStore';
interface PartialJourneySummaryProps {
  trainNumber: string;
  trainName: string;
  boarding: RouteStopResponse;
  deboarding: RouteStopResponse;
  onClear: () => void;
}
export default function PartialJourneySummary({
  trainNumber,
  trainName,
  boarding,
  deboarding,
  onClear,
}: PartialJourneySummaryProps) {
  const segment = computePartialJourney(boarding, deboarding);
  const [from, to] =
    boarding.sequenceNo <= deboarding.sequenceNo
      ? [boarding, deboarding]
      : [deboarding, boarding];
  useSavedJourneys();
  const saved = isJourneySaved(trainNumber, from.stationCode, to.stationCode);
  function handleToggleSave() {
    toggleSavedJourney({
      trainNumber,
      trainName,
      boardingStationCode: from.stationCode,
      boardingStationName: from.stationName,
      deboardingStationCode: to.stationCode,
      deboardingStationName: to.stationName,
      distanceKm: segment?.distanceKm ?? 0,
      durationMinutes: segment?.durationMinutes ?? null,
    });
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-200 bg-orange-50 px-5 py-3 dark:border-orange-500/30 dark:bg-orange-500/10">
      <div className="flex items-center gap-2 text-sm">
        <MapPin
          className="h-4 w-4 shrink-0 text-orange-600"
          aria-hidden="true"
        />

        <span className="font-medium text-slate-900 dark:text-slate-100">
          {from.stationCode} → {to.stationCode}
        </span>

        <span className="text-slate-500 dark:text-slate-400">
          · {segment ? `${segment.distanceKm} km` : '--'} ·{' '}
          {segment ? formatPartialDuration(segment.durationMinutes) : '--'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleSave}
          aria-pressed={saved}
          className={`flex items-center gap-1 rounded-md text-xs font-medium transition-colors ${
            saved
              ? 'text-orange-700 dark:text-orange-300'
              : 'text-slate-500 hover:text-orange-700 dark:text-slate-400 dark:hover:text-orange-300'
          }`}
        >
          <Bookmark
            className="h-3.5 w-3.5"
            aria-hidden="true"
            fill={saved ? 'currentColor' : 'none'}
          />
          {saved ? 'Saved' : 'Save'}
        </button>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 rounded-md text-xs font-medium text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      </div>
    </div>
  );
}
