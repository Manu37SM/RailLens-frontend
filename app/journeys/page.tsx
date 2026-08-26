import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import JourneySearchClient from '@/components/journey/JourneySearchClient';
export const metadata: Metadata = {
  title: 'Trains Between Stations | RailLens',
  description:
    'Find trains running between any two stations on Indian Railways.',
};
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

      <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Trains Between Stations
      </h1>

      <JourneySearchClient initialFrom={from} initialTo={to} />
    </Container>
  );
}
