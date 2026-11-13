import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import BookingGate from '@/components/booking/BookingGate';
import BookingDetail from '@/components/booking/BookingDetail';
import RailOpsWaker from '@/components/RailOpsWaker';
import { bookingEnabled } from '@/lib/booking/config';

export const metadata: Metadata = {
  title: 'Booking | RailLens',
  robots: { index: false, follow: false },
};

export default async function BookingPage({
  params,
}: {
  params: Promise<{ pnr: string }>;
}) {
  const { pnr } = await params;
  if (!/^[1-9][0-9]{9}$/.test(pnr)) notFound();
  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-800">
      <Container>
        {bookingEnabled() && <RailOpsWaker />}
        <BookingGate>
          <BookingDetail pnr={pnr} />
        </BookingGate>
      </Container>
    </div>
  );
}
