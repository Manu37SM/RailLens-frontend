import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Container from '@/components/layout/Container';
import StationDetailsClient from '@/components/station/StationDetailsClient';
import { getStation } from '@/services/stationService';
import { ApiError } from '@/services/api';
import { StationResponse } from '@/types/station';

interface StationPageProps {
  params: Promise<{
    stationCode: string;
  }>;
}

export async function generateMetadata({
  params,
}: StationPageProps): Promise<Metadata> {
  const { stationCode } = await params;

  try {
    const station = await getStation(stationCode);

    return {
      title: `${station.stationName} (${station.stationCode}) | RailLens`,
      description: `Trains passing through ${station.stationName} station (${station.stationCode}) - arrivals, departures and schedules on RailLens.`,
    };
  } catch {
    return { title: `Station ${stationCode} | RailLens` };
  }
}

export default async function StationPage({ params }: StationPageProps) {
  const { stationCode } = await params;

  let station: StationResponse;

  try {
    station = await getStation(stationCode);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-5">
      <Container>
        <StationDetailsClient station={station} />
      </Container>
    </div>
  );
}
