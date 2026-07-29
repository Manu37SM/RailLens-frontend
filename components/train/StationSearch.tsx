import { Search } from 'lucide-react';

interface StationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StationSearch({ value, onChange }: StationSearchProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        aria-hidden="true"
        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />

      <input
        type="text"
        data-global-search
        placeholder="Search station..."
        aria-label="Search station"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 pr-3 pl-10 text-base sm:text-sm text-slate-900 dark:text-slate-100 transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-100 focus:outline-none"
      />
    </div>
  );
}
