import Breadcrumb from '@/components/layout/Breadcrumb';
import Container from '@/components/layout/Container';
import StationSearchClient from '@/components/station/StationSearchClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Station Search | RailLens',
};

export default function StationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-5">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Stations' }]}
        />

        <StationSearchClient />
      </Container>
    </main>
  );
}
