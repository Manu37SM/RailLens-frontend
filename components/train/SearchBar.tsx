"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  loading,
}: SearchBarProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search by train number or train name..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
          className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base shadow-sm transition-all outline-none placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <button
        onClick={onSearch}
        disabled={loading}
        className="flex h-14 items-center justify-center rounded-2xl bg-primary px-8 font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </div>
  );
}