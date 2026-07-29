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
