import { TrainFront } from 'lucide-react';

import Container from '@/components/layout/Container';
import TrainSearchClient from '@/components/train/TrainSearchClient';

export default function TrainsPage() {
  return (
    <Container>
      <section className="py-12">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="bg-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white">
            <TrainFront size={32} />
          </div>

          <h1 className="text-4xl font-bold">Train Search</h1>

          <p className="mt-4 text-gray-600">
            Search Indian Railways by train number or train name.
          </p>
        </div>

        <TrainSearchClient />
      </section>
    </Container>
  );
}
