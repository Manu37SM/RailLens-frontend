'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Stethoscope } from 'lucide-react';

import Card from '@/components/layout/Card';
import { getDatasetHealth } from '@/services/adminService';
import { ApiError } from '@/services/api';
import { DatasetHealthResponse } from '@/types/admin';

interface Props {
  adminKey: string;
}

const CHECKS: { key: keyof DatasetHealthResponse; countKey: keyof DatasetHealthResponse; label: string }[] = [
  { key: 'duplicateScheduleRowSamples', countKey: 'duplicateScheduleRowCount', label: 'Duplicate schedule rows' },
  { key: 'missingTimingSamples', countKey: 'missingTimingCount', label: 'Missing timings' },
  { key: 'distanceInconsistencySamples', countKey: 'distanceInconsistencyCount', label: 'Distance inconsistencies' },
  { key: 'impossibleSpeedSamples', countKey: 'impossibleSpeedCount', label: 'Impossible speeds' },
  { key: 'haltAnomalySamples', countKey: 'haltAnomalyCount', label: 'Halt anomalies' },
  { key: 'orphanStationSamples', countKey: 'orphanStationCount', label: 'Orphan stations' },
  { key: 'invalidRouteSamples', countKey: 'invalidRouteCount', label: 'Invalid routes' },
];

export default function DatasetHealthPanel({ adminKey }: Props) {
  const [health, setHealth] = useState<DatasetHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function runCheck() {
    setLoading(true);
    setError(null);

    try {
      setHealth(await getDatasetHealth(adminKey));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to run dataset health check.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Stethoscope className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Dataset health
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Live diagnostics over the current database - duplicate rows, missing timings,
            distance/speed inconsistencies, halt anomalies, orphan stations, and invalid routes.
          </p>
        </div>

        <button
          type="button"
          onClick={runCheck}
          disabled={loading}
          className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Run check'}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {health && (
        <div className="mt-4">
          <div
            className={`mb-3 flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
              health.totalIssues === 0
                ? 'bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
            }`}
          >
            {health.totalIssues === 0 ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {health.totalIssues === 0
              ? 'No issues found.'
              : `${health.totalIssues.toLocaleString()} issue${health.totalIssues === 1 ? '' : 's'} found.`}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {CHECKS.map(({ key, countKey, label }) => {
              const count = health[countKey] as number;
              const samples = health[key] as string[];
              const isExpanded = expanded === key;

              return (
                <div key={key} className="py-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : key)}
                    disabled={count === 0}
                    className="flex w-full items-center justify-between text-left text-sm disabled:cursor-default"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{label}</span>
                    <span
                      className={`font-semibold ${
                        count === 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {count.toLocaleString()}
                    </span>
                  </button>

                  {isExpanded && samples.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {samples.map((sample) => (
                        <li key={sample}>{sample}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
