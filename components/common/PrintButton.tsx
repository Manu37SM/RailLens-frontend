'use client';
import { Printer } from 'lucide-react';
export default function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
