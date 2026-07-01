import Container from '@/components/layout/Container';
import TrainDetailsClient from '@/components/train/TrainDetailsClient';
import { getTrainDetails } from '@/services/trainService';

interface TrainDetailsPageProps {
  params: Promise<{
    trainNumber: string;
  }>;
}

export default async function TrainDetailsPage({
  params,
}: TrainDetailsPageProps) {
  const { trainNumber } = await params;

  const train = await getTrainDetails(trainNumber);

  return (
    <main className="min-h-screen bg-slate-50 py-5">
      <Container>
        <TrainDetailsClient train={train} />
      </Container>
    </main>
  );
}
