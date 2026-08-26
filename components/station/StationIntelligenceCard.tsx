'use client';
import { useEffect, useState } from 'react';
import { Award, Gauge, Network, Share2 } from 'lucide-react';
import { getStationIntelligence } from '@/services/stationService';
import { ApiError } from '@/services/api';
import { StationIntelligenceResponse } from '@/types/stationIntelligence';
interface Props {
  stationCode: string;
}
export default function StationIntelligenceCard({ stationCode }: Props) {
  const [data, setData] = useState<StationIntelligenceResponse | null>(null);
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
    getStationIntelligence(stationCode)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not load station insights.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stationCode]);
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
    icon: typeof Network;
  }[] = [
    {
      label: 'Network rank',
      value:
        data.networkRank != null
          ? `#${data.networkRank} of ${data.totalStationsInNetwork}`
          : 'N/A',
      icon: Award,
    },
    {
      label: 'Connectivity',
      value: `${data.connectivityScore}/100`,
      icon: Network,
    },
    { label: 'Direct links', value: `${data.degree}`, icon: Share2 },
    {
      label: 'Avg speed through',
      value:
        data.averageTrainSpeedKmh != null
          ? `${data.averageTrainSpeedKmh} km/h`
          : 'N/A',
      icon: Gauge,
    },
  ];
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <Network size={18} className="text-orange-600" aria-hidden="true" />
        Station Intelligence
      </h2>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Computed from every train&apos;s schedule and RailLens&apos;s station
        network graph - free, no external API or live data involved.
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
        <span>Origin: {data.originPercent}%</span>
        <span>Destination: {data.destinationPercent}%</span>
        <span>Transit: {data.transitPercent}%</span>
        <span>Avg halt: {data.averageHaltMinutes} min</span>
      </div>
    </section>
  );
}
