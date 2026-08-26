import Link from 'next/link';
import { TrainFront } from 'lucide-react';
import Card from '@/components/layout/Card';
import { addTrainSearch } from '@/stores/recentSearchStore';
import { TrainSearchResponse } from '@/types/train';
interface TrainCardProps {
  train: TrainSearchResponse;
}
export default function TrainCard({ train }: TrainCardProps) {
  return (
    <Link
      href={`/trains/${train.trainNumber}`}
      onClick={() => addTrainSearch(train.trainNumber, train.trainName)}
      className="block"
    >
      <Card className="group rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50/30 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-600 dark:bg-orange-500/15">
            <TrainFront size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-orange-600 uppercase">
              {train.trainNumber}
            </p>

            <h2 className="mt-0.5 truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              {train.trainName}
            </h2>
          </div>
        </div>
      </Card>
    </Link>
  );
}
