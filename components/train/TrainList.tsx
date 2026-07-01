import TrainCard from './TrainCard';
import { TrainSearchResponse } from '@/types/train';

interface TrainListProps {
  trains: TrainSearchResponse[];
}

export default function TrainList({ trains }: TrainListProps) {
  if (trains.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      {trains.map((train) => (
        <TrainCard key={train.trainNumber} train={train} />
      ))}
    </div>
  );
}
