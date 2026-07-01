import { RouteStopResponse } from "@/types/train";
import JourneyRow from "./JourneyRow";
import StationSearch from "./StationSearch";

interface JourneyTableProps {
  route: RouteStopResponse[];
  search: string;
  onSearch: (value: string) => void;
}

export default function JourneyTable({
  route,
  search,
  onSearch,
}: JourneyTableProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Journey Timetable
        </h2>
      </div>

      {/* Search */}

      <div className="border-b border-slate-200 px-5 py-3">
        <StationSearch
          value={search}
          onChange={onSearch}
        />
      </div>

      {/* Sticky Column Header */}

      <div className="sticky top-0 z-10 grid grid-cols-[48px_1fr_80px_80px_56px_70px] items-center bg-slate-50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">

        <div />

        <div>Station</div>

        <div className="text-center">
          Arrival
        </div>

        <div className="text-center">
          Departure
        </div>

        <div className="text-center">
          Day
        </div>

        <div className="text-right">
          Km
        </div>

      </div>

      {/* Route */}

      <div className="relative">

        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

        {route.map((stop) => (
          <JourneyRow
            key={stop.sequenceNo}
            stop={stop}
          />
        ))}

      </div>
    </section>
  );
}