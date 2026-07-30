import Breadcrumb from '@/components/layout/Breadcrumb';
import Container from '@/components/layout/Container';
import StationSearchClient from '@/components/station/StationSearchClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Station Search | RailLens',
};

export default function StationsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-5">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Stations' }]}
        />

        {/* Page-level heading - /trains has one, this page didn't (see
            frontend architecture review's accessibility findings). */}
        <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Station Search
        </h1>

        <StationSearchClient />
      </Container>
    </div>
  );
}
