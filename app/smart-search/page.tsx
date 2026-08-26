import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SmartSearchClient from '@/components/smartsearch/SmartSearchClient';
export const metadata: Metadata = {
  title: 'Smart Search | RailLens',
  description:
    'Search trains with plain-English-ish queries, like "trains that stop at both NDLS and HWH".',
};
export default function SmartSearchPage() {
  return (
    <div className="bg-slate-50 py-6 dark:bg-slate-800">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Smart Search' }]}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Smart Search
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Ask for trains in a few fixed phrasings - stops, routes, distance,
            and halt count - no external services involved.
          </p>
        </div>

        <SmartSearchClient />
      </Container>
    </div>
  );
}
