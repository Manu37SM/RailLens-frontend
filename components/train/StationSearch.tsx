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
        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        placeholder="Search station..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pr-3 pl-10 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 focus:outline-none"
      />
    </div>
  );
}
