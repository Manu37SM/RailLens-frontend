interface TrainHeaderProps {
  trainNumber: string;
  trainName: string;
  sourceStationName: string;
  destinationStationName: string;

  distance: number;
  stops: number;
  minutes: number;
  speed: number;
}

function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}

export default function TrainHeader({
  trainNumber,
  trainName,
  sourceStationName,
  destinationStationName,
  distance,
  stops,
  minutes,
  speed,
}: TrainHeaderProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

      <div className="flex items-center gap-3">

          <span className="text-base font-semibold text-blue-600">
              {trainNumber}
          </span>

          <div className="h-1 w-1 rounded-full bg-slate-300" />

          <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {trainName}
          </h1>

      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">

        <span className="font-medium text-slate-900">
          {sourceStationName}
        </span>

        <span className="text-blue-600">
          →
        </span>

        <span className="font-medium text-slate-900">
          {destinationStationName}
        </span>

      </div>

      <div className="mt-4 flex flex-wrap gap-2">

        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          Distance
          <span className="ml-2 font-semibold text-slate-900">
            {distance} km
          </span>
        </span>

        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          Duration
          <span className="ml-2 font-semibold text-slate-900">
            {formatDuration(minutes)}
          </span>
        </span>

        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          Stops
          <span className="ml-2 font-semibold text-slate-900">
            {stops}
          </span>
        </span>

        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          Avg Speed
          <span className="ml-2 font-semibold text-slate-900">
            {speed} km/h
          </span>
        </span>

      </div>

    </section>
  );
}