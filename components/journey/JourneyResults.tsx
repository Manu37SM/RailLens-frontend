import { JourneySearchResponse } from '@/types/journey';
import JourneyResultRow from './JourneyResultRow';
import { SearchX } from 'lucide-react';
import Card from '@/components/layout/Card';

interface Props {
  results: JourneySearchResponse | null;
  loading: boolean;
}

export default function JourneyResults({ results, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="space-y-4">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-4 w-56 rounded bg-slate-200" />

              <div className="flex justify-between">
                <div className="h-6 w-20 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded bg-slate-200" />
              </div>

              <div className="h-4 w-24 rounded bg-slate-200" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!results) {
    return null;
  }

  if (results.totalTrains === 0) {
    return (
      <Card className="py-12">
        <div className="flex flex-col items-center text-center">
          <SearchX className="mb-4 h-12 w-12 text-slate-400" />

          <h3 className="text-lg font-semibold">No trains found</h3>

          <p className="mt-2 text-sm text-slate-500">
            We couldn&apos;t find any direct trains between these stations.
          </p>

          <p className="text-sm text-slate-500">
            Try another station combination.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {results.totalTrains} train{results.totalTrains !== 1 && 's'} found
      </p>

      {results.trains.map((train) => (
        <JourneyResultRow key={train.trainNumber} train={train} />
      ))}
    </div>
  );
}
