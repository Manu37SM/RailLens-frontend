'use client';
import { Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
interface ExportCsvButtonProps {
  filename: string;
  csv: string;
  label?: string;
  disabled?: boolean;
}
export default function ExportCsvButton({
  filename,
  csv,
  label = 'Export CSV',
  disabled = false,
}: ExportCsvButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => downloadCsv(filename, csv)}
      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
