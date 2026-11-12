import { Suspense } from 'react';
import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import BookingGate from '@/components/booking/BookingGate';
import BookingForm from '@/components/booking/BookingForm';

export const metadata: Metadata = {
  title: 'Book | RailLens',
  robots: { index: false, follow: false },
};

export default function BookPage() {
  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-800">
      <Container>
        <BookingGate>
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
        </BookingGate>
      </Container>
    </div>
  );
}
