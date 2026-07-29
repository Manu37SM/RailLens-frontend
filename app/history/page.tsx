import { Metadata } from 'next';

import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SearchHistoryList from '@/components/history/SearchHistoryList';

export const metadata: Metadata = {
  title: 'Search History | RailLens',
};

export default function HistoryPage() {
  return (
    <Container>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'History' }]} />

      <section className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Search History
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Every train, station and journey you&apos;ve searched for,
            stored on this device.
          </p>
        </div>

        <SearchHistoryList />
      </section>
    </Container>
  );
}
