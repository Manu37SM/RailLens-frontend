import { Metadata } from 'next';
import { TrainFront } from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Container from '@/components/layout/Container';
import TrainSearchClient from '@/components/train/TrainSearchClient';
export const metadata: Metadata = {
  title: 'Train Search | RailLens',
  description:
    'Search Indian Railways trains by number or name and view full routes, schedules and stops.',
};
export default function TrainsPage() {
  return (
    <Container>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Train Search', href: '/trains' },
        ]}
      />
      <section className="py-6">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <div className="bg-primary mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-lg text-white">
            <TrainFront size={32} />
          </div>

          <h1 className="text-2xl font-bold">Train Search</h1>

          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Search by train number or train name.
          </p>
        </div>

        <TrainSearchClient />
      </section>
    </Container>
  );
}
