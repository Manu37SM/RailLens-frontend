'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  LogOut,
  RefreshCw,
  TrainFront,
  MapPin,
  Route,
} from 'lucide-react';

import Card from '@/components/layout/Card';
import AdminKeyForm from './AdminKeyForm';
import DatasetHealthPanel from './DatasetHealthPanel';
import { clearAdminKey, useAdminKey } from '@/stores/adminKeyStore';
import { clearCache, getAdminStats, triggerImport } from '@/services/adminService';
import { ApiError } from '@/services/api';
import { AdminStatsResponse, ImportResult } from '@/types/admin';

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrainFront;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
        <Icon className="h-5 w-5 text-orange-600" aria-hidden="true" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value.toLocaleString()}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const adminKey = useAdminKey();

  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [confirmingImport, setConfirmingImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [cacheError, setCacheError] = useState<string | null>(null);

  async function loadStats(key: string) {
    setLoadingStats(true);
    setStatsError(null);

    try {
      setStats(await getAdminStats(key));
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 503)) {
        // Invalid/unconfigured key - drop it so AdminKeyForm reappears
        // instead of silently retrying with a key that will never work.
        clearAdminKey();
        setStatsError('Invalid admin key.');
      } else {
        setStatsError(
          err instanceof ApiError ? err.message : 'Failed to load admin stats.'
        );
      }
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    if (adminKey) {
      loadStats(adminKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  if (!adminKey) {
    return <AdminKeyForm error={statsError} />;
  }

  async function handleImport() {
    if (!adminKey) return;

    setImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const result = await triggerImport(adminKey);
      setImportResult(result);

      if (result.success) {
        loadStats(adminKey);
      }
    } catch (err) {
      setImportError(
        err instanceof ApiError ? err.message : 'Import failed. Please try again.'
      );
    } finally {
      setImporting(false);
      setConfirmingImport(false);
    }
  }

  async function handleClearCache() {
    if (!adminKey) return;

    setClearingCache(true);
    setCacheError(null);
    setCacheCleared(false);

    try {
      await clearCache(adminKey);
      setCacheCleared(true);
    } catch (err) {
      setCacheError(
        err instanceof ApiError ? err.message : 'Failed to clear cache. Please try again.'
      );
    } finally {
      setClearingCache(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Admin Portal
        </h1>

        <button
          type="button"
          onClick={() => clearAdminKey()}
          className="flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Forget key
        </button>
      </div>

      {statsError && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {statsError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={TrainFront} label="Trains" value={stats?.totalTrains ?? 0} />
        <StatCard icon={MapPin} label="Stations" value={stats?.totalStations ?? 0} />
        <StatCard icon={Route} label="Schedule rows" value={stats?.totalScheduleRows ?? 0} />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Import railway dataset
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Re-reads the bundled CSV and replaces schedule data for every
              train it contains. This cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadStats(adminKey)}
            aria-label="Refresh stats"
            className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="mt-4">
          {confirmingImport ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Run the import now? This will overwrite existing schedule
                data.
              </span>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {importing ? 'Importing...' : 'Confirm import'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingImport(false)}
                disabled={importing}
                className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingImport(true)}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Run import
            </button>
          )}
        </div>

        {importError && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {importError}
          </p>
        )}

        {importResult && (
          <div
            role="status"
            className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-sm ${
              importResult.success
                ? 'bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300'
                : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300'
            }`}
          >
            {importResult.success ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{importResult.message}</span>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <Database className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Cache
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Train/station detail lookups and the stats page are cached for
              up to 15 minutes. Writes already clear this automatically -
              this is a manual escape hatch, not something you should need
              day to day.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={clearingCache}
            className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clearingCache ? 'Clearing...' : 'Clear cache'}
          </button>
        </div>

        {cacheError && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {cacheError}
          </p>
        )}

        {cacheCleared && (
          <p role="status" className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
            Cache cleared.
          </p>
        )}
      </Card>

      <DatasetHealthPanel adminKey={adminKey} />
    </div>
  );
}
