'use client';
import { useEffect, useState } from 'react';
import { Brain, Gauge, Moon, Route, Sparkles, Sun } from 'lucide-react';
import { getTrainIntelligence } from '@/services/trainService';
import { ApiError } from '@/services/api';
import { TrainIntelligenceResponse } from '@/types/trainIntelligence';
interface Props {
  trainNumber: string;
}
export default function TrainIntelligenceCard({ trainNumber }: Props) {
  const [data, setData] = useState<TrainIntelligenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });
    getTrainIntelligence(trainNumber)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not load train insights.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trainNumber]);
  if (loading) {
    return (
      <section className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </section>
    );
  }
  if (error || !data) {
    return null;
  }
  const stats: {
    label: string;
    value: string;
    icon: typeof Brain;
  }[] = [
    {
      label: 'Route complexity',
      value: `${data.routeComplexityScore}/100`,
      icon: Route,
    },
    {
      label: 'Uniqueness',
      value: `${data.trainUniquenessScore}/100`,
      icon: Sparkles,
    },
    {
      label: 'Efficiency',
      value: `${data.journeyEfficiencyIndex}/100`,
      icon: Gauge,
    },
    {
      label: 'Expressness',
      value: `${data.expressnessScoreKmPerHalt} km/halt`,
      icon: Brain,
    },
  ];
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <Brain size={18} className="text-orange-600" aria-hidden="true" />
        Train Intelligence
        {data.isCircularRoute && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            Circular route
          </span>
        )}
      </h2>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Computed entirely from this train&apos;s own schedule and
        RailLens&apos;s station network graph - free, on-device to our servers,
        no external API or live data involved.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <Icon size={16} className="text-orange-600" aria-hidden="true" />
            <div className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
              {value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <Moon size={14} className="text-indigo-500" aria-hidden="true" />
          {data.nightTravelPercent}% night travel
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sun size={14} className="text-amber-500" aria-hidden="true" />
          {data.dayTravelPercent}% day travel
        </span>
        <span>Avg halt: {data.averageHaltMinutes} min</span>
        {data.longestNonStopSegmentKm != null && (
          <span>
            Longest non-stop: {data.longestNonStopSegmentKm} km
            {data.longestNonStopSegmentFromStation &&
              data.longestNonStopSegmentToStation && (
                <>
                  {' '}
                  ({data.longestNonStopSegmentFromStation} &rarr;{' '}
                  {data.longestNonStopSegmentToStation})
                </>
              )}
          </span>
        )}
      </div>

      {data.possiblySkippedStations.length > 0 && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Possibly skips: {data.possiblySkippedStations.slice(0, 8).join(', ')}
          {data.possiblySkippedStations.length > 8 &&
            ` +${data.possiblySkippedStations.length - 8} more`}{' '}
          - stations other trains stop at directly between two of this
          train&apos;s consecutive stops, not a confirmed geographic fact.
        </p>
      )}
    </section>
  );
}
