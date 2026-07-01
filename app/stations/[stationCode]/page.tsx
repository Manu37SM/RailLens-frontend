import Container from '@/components/layout/Container';
import StationDetailsClient from '@/components/station/StationDetailsClient';
import { getStation } from '@/services/stationService';

interface StationPageProps {
  params: Promise<{
    stationCode: string;
  }>;
}

export default async function StationPage({ params }: StationPageProps) {
  const { stationCode } = await params;

  const station = await getStation(stationCode);

  return (
    <main className="min-h-screen bg-slate-50 py-5">
      <Container>
        <StationDetailsClient station={station} />
      </Container>
    </main>
  );
}
