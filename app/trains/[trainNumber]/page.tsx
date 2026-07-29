import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Container from '@/components/layout/Container';
import TrainDetailsClient from '@/components/train/TrainDetailsClient';
import { getTrainDetails } from '@/services/trainService';
import { ApiError } from '@/services/api';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { TrainDetailsResponse } from '@/types/train';

interface TrainDetailsPageProps {
  params: Promise<{
    trainNumber: string;
  }>;
}

// Next.js automatically dedupes identical fetch() calls made during the
// same request, so this and the page component below both calling
// getTrainDetails(trainNumber) results in one network call, not two.
export async function generateMetadata({
  params,
}: TrainDetailsPageProps): Promise<Metadata> {
  const { trainNumber } = await params;

  try {
    const train = await getTrainDetails(trainNumber);

    return {
      title: `${train.trainNumber} ${train.trainName} | RailLens`,
      description: `Live route, schedule and stops for train ${train.trainNumber} (${train.trainName}) on RailLens.`,
    };
  } catch {
    // Falls through to the route's own notFound() handling below - a
    // missing/failed lookup here shouldn't crash metadata generation.
    return { title: `Train ${trainNumber} | RailLens` };
  }
}

export default async function TrainDetailsPage({
  params,
}: TrainDetailsPageProps) {
  const { trainNumber } = await params;

  let train: TrainDetailsResponse;

  try {
    train = await getTrainDetails(trainNumber);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="bg-background py-5">
      <Container>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Train Search', href: '/trains' },
            { label: train.trainNumber },
          ]}
        />
        <TrainDetailsClient train={train} />
      </Container>
    </div>
  );
}
