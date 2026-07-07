import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import JourneySearchClient from '@/components/journey/JourneySearchClient';

interface JourneysPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function JourneysPage({
  searchParams,
}: JourneysPageProps) {
  const { from, to } = await searchParams;

  return (
    <Container>
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Between Stations' }]}
      />

      <JourneySearchClient initialFrom={from} initialTo={to} />
    </Container>
  );
}
