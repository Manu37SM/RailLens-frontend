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
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  homeHref = '/',
  homeLabel = 'Go home',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle size={24} />
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>

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
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
