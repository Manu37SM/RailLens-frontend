import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import BookingGate from '@/components/booking/BookingGate';
import MyBookings from '@/components/booking/MyBookings';
import RailOpsWaker from '@/components/RailOpsWaker';
import { bookingEnabled } from '@/lib/booking/config';

export const metadata: Metadata = {
  title: 'My bookings | RailLens',
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-800">
      <Container>
        {bookingEnabled() && <RailOpsWaker />}
        <BookingGate>
          <MyBookings />
        </BookingGate>
      </Container>
    </div>
  );
}
