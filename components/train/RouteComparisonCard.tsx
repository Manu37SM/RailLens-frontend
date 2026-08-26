'use client';
import { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { compareRoutes } from '@/services/trainService';
import { ApiError } from '@/services/api';
import { RouteComparisonResponse } from '@/types/routeComparison';
interface Props {
  trainNumber: string;
}
export default function RouteComparisonCard({ trainNumber }: Props) {
  const [otherTrainNumber, setOtherTrainNumber] = useState('');
  const [result, setResult] = useState<RouteComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleCompare(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otherTrainNumber.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await compareRoutes(trainNumber, otherTrainNumber.trim()));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not compare these trains.'
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <GitCompare size={18} className="text-orange-600" aria-hidden="true" />
        Compare route
      </h2>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Compare this train&apos;s route against another train&apos;s - shared
        stations, longest common section, and whether one is the other&apos;s
        reverse.
      </p>

      <form onSubmit={handleCompare} className="mt-3 flex gap-2">
        <input
          type="text"
          value={otherTrainNumber}
          onChange={(e) => setOtherTrainNumber(e.target.value)}
          placeholder="Other train number"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-orange-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {result.isSameRoute && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">
                Identical route
              </span>
            )}
            {result.isReverseRoute && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                Reverse route
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Shared stations
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {result.sharedStationCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Similarity
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {result.routeSimilarityPercent}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Longest common section
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {result.longestCommonSegment.length} station
                {result.longestCommonSegment.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {result.longestCommonSegment.length > 0 && (
            <p className="text-slate-600 dark:text-slate-300">
              Shared section: {result.longestCommonSegment.join(' → ')}
            </p>
          )}

          {result.divergencePoint && (
            <p className="text-slate-500 dark:text-slate-400">
              Diverges after {result.divergencePoint}
            </p>
          )}

          {result.convergencePoint && (
            <p className="text-slate-500 dark:text-slate-400">
              Reconverges at {result.convergencePoint}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
