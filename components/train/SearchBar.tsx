'use client';
import { Search, X } from 'lucide-react';
interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query?: string) => void | Promise<void>;
  loading: boolean;
}
export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  loading,
}: SearchBarProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          size={18}
          aria-hidden="true"
          className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />

        <input
          type="text"
          data-global-search
          placeholder="Train number or name"
          aria-label="Train number or name"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch();
            }
          }}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pr-10 pl-10 text-base shadow-sm transition-all outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500"
        />

        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSearch()}
        disabled={loading || !query.trim()}
        className="bg-primary flex h-11 items-center justify-center rounded-lg px-8 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}
