import Container from '@/components/layout/Container';
import TrainDetailsClient from '@/components/train/TrainDetailsClient';
import { getTrainDetails } from '@/services/trainService';
import Breadcrumb from '@/components/layout/Breadcrumb';

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
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Train Search' }]}
        />
        <TrainDetailsClient train={train} />
      </Container>
    </main>
  );
}
