'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  homeHref?: string;
  homeLabel?: string;
}

/**
 * Shared "something went wrong" panel. Used by route-level error/not-found
 * boundaries and by client components whose own data fetch (search, etc.)
 * failed, so every failure in the app looks and behaves consistently.
 *
 * Documented, intentional exception: TrainIntelligenceCard and
 * StationIntelligenceCard (components/train, components/station) do NOT
 * use this component - they render nothing (`return null`) on a failed
 * fetch instead. That's a deliberate choice for those two specific cards,
 * not an oversight: both are supplementary "enrichment" sections on a
 * page that's already fully useful without them (train/station route and
 * schedule data loads separately and doesn't depend on these cards), so a
 * quiet failure there is less disruptive than a visible error block for
 * something the user didn't explicitly ask for. This is *not* the right
 * default for anything else - any future card/section that becomes
 * load-bearing (the user came to the page specifically for it, or it's
 * the result of a user-initiated action like a search or form submit)
 * should use ErrorState like everything else in the app does, the same
 * way RouteComparisonCard (a user-initiated comparison) shows a visible
 * inline error rather than failing silently. See the frontend
 * architecture review's "two different 'something went wrong' conventions
 * now coexist" finding - if you're adding a third silent-failure card,
 * make sure it's genuinely as optional as those two before copying the
 * pattern.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  homeHref = '/',
  homeLabel = 'Go home',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-12 text-center shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle size={24} />
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>

      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="bg-primary rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
        )}

        <Link
          href={homeHref}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
