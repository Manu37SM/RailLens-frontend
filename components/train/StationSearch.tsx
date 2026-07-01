import { Search } from "lucide-react";

interface StationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StationSearch({
  value,
  onChange,
}: StationSearchProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        placeholder="Search station..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-10
          w-full
          rounded-lg
          border
          border-slate-300
          bg-slate-50
          pl-10
          pr-3
          text-sm
          text-slate-900
          placeholder:text-slate-400
          transition
          focus:border-blue-500
          focus:bg-white
          focus:outline-none
          focus:ring-2
          focus:ring-blue-100
        "
      />
    </div>
  );
}