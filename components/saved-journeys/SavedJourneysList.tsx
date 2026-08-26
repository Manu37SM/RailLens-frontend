'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Bookmark, Route, Trash2, X } from 'lucide-react';
import Card from '@/components/layout/Card';
import {
  clearSavedJourneys,
  removeSavedJourney,
  useSavedJourneys,
} from '@/stores/savedJourneyStore';
import { formatPartialDuration } from '@/lib/partialJourney';
export default function SavedJourneysList() {
  const journeys = useSavedJourneys();
  const [confirmingClear, setConfirmingClear] = useState(false);
  if (journeys.length === 0) {
    return (
      <Card className="py-10">
        <div className="flex flex-col items-center text-center">
          <Bookmark className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-500" />

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No saved journeys yet
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Open a train, tap &quot;Plan a partial journey&quot;, pick your
            boarding and de-boarding stops, then tap Save to keep it here.
          </p>

          <Link
            href="/trains"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Browse trains
          </Link>
        </div>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        {confirmingClear ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Remove all {journeys.length} saved journey
              {journeys.length !== 1 ? 's' : ''}?
            </span>
            <button
              type="button"
              onClick={() => {
                clearSavedJourneys();
                setConfirmingClear(false);
              }}
              className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {journeys.map((journey) => (
          <Card key={journey.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-500/15">
              <Route className="h-5 w-5 text-orange-600" aria-hidden="true" />
            </div>

            <Link
              href={`/trains/${journey.trainNumber}`}
              className="min-w-0 flex-1"
            >
              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {journey.boardingStationCode} → {journey.deboardingStationCode}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {journey.trainNumber} · {journey.trainName} ·{' '}
                {journey.distanceKm} km ·{' '}
                {formatPartialDuration(journey.durationMinutes)}
              </p>
            </Link>

            <button
              type="button"
              onClick={() => removeSavedJourney(journey.id)}
              aria-label={`Remove saved journey ${journey.boardingStationCode} to ${journey.deboardingStationCode}`}
              className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
