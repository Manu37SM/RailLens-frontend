'use client';

import Link from 'next/link';
import { TrainFront, MapPinned, Route } from 'lucide-react';

import Card from '@/components/ui/Card';
import { RecentSearch } from '@/types/recentSearch';

interface RecentSearchCardProps {
  search: RecentSearch;
}

export default function RecentSearchCard({ search }: RecentSearchCardProps) {
  switch (search.type) {
    case 'train':
      return (
        <Link href={`/trains/${search.trainNumber}`}>
          <Card className="h-full p-3 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <TrainFront className="text-primary" size={20} />

              <div>
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  {search.trainNumber}
                </p>

                <h3 className="font-medium text-slate-900">
                  {search.trainName}
                </h3>
              </div>
            </div>
          </Card>
        </Link>
      );

    case 'station':
      return (
        <Link href={`/stations/${search.stationCode}`}>
          <Card className="h-full p-3 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <MapPinned className="text-primary" size={20} />

              <div>
                <h3 className="font-medium text-slate-900">
                  {search.stationName}
                </h3>

                <p className="text-sm text-slate-500">{search.stationCode}</p>
              </div>
            </div>
          </Card>
        </Link>
      );

    case 'journey':
      return (
        <Link href={`/journeys?from=${search.fromCode}&to=${search.toCode}`}>
          <Card className="h-full p-3 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <Route className="text-primary" size={20} />

              <div>
                <h3 className="font-medium text-slate-900">
                  {search.fromName} → {search.toName}
                </h3>

                <p className="text-sm text-slate-500">
                  {search.fromCode} → {search.toCode}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      );
  }
}
