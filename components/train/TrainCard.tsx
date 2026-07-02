import Link from 'next/link';
import { ArrowRight, TrainFront } from 'lucide-react';
import Card from '@/components/layout/Card';
import { TrainSearchResponse } from '@/types/train';
import { addTrainSearch } from '@/stores/recentSearchStore';

interface TrainCardProps {
  train: TrainSearchResponse;
}

export default function TrainCard({ train }: TrainCardProps) {
  return (
    <Link
      href={`/trains/${train.trainNumber}`}
      className="block"
      onClick={() => addTrainSearch(train.trainNumber, train.trainName)}
    >
      <Card className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wider uppercase">
              {train.trainNumber}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {train.trainName}
            </h2>
          </div>

          <div className="text-primary rounded-xl bg-blue-50 p-3">
            <TrainFront size={24} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500">View complete journey</span>

          <ArrowRight
            size={18}
            className="text-primary transition-transform group-hover:translate-x-1"
          />
        </div>
      </Card>
    </Link>
  );
}
