'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { bookingEnabled } from '@/lib/booking/config';
import { useHasMounted } from '@/lib/useHasMounted';
import { useAuthSession } from '@/stores/authStore';
import { cardClasses } from '@/lib/formStyles';

/** Booking pages need booking switched on and a signed-in person; otherwise say so plainly. */
export default function BookingGate({ children }: { children: ReactNode }) {
  const mounted = useHasMounted();
  const session = useAuthSession();
  if (!bookingEnabled()) {
    return (
      <div className={cardClasses}>
        <p className="text-slate-700 dark:text-slate-300">
          Booking isn’t available on this site yet.
        </p>
      </div>
    );
  }
  if (!mounted) return null;
  if (!session) {
    return (
      <div className={cardClasses}>
        <p className="text-slate-700 dark:text-slate-300">
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            Log in
          </Link>{' '}
          to book and see your bookings.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
