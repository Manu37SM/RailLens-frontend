import { TrainFront } from 'lucide-react';

interface TrainHeroProps {
  trainNumber: string;
  trainName: string;
}

export default function TrainHero({ trainNumber, trainName }: TrainHeroProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="bg-primary flex h-20 w-20 items-center justify-center rounded-2xl text-white">
          <TrainFront size={38} />
        </div>

        <div>
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
            Train
          </p>

          <h1 className="mt-2 text-5xl font-bold tracking-tight text-slate-900">
            {trainNumber}
          </h1>

          <p className="mt-2 text-2xl text-slate-600">{trainName}</p>
        </div>
      </div>
    </section>
  );
}
