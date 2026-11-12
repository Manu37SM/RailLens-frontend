import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookingDetail from './BookingDetail';
import { ApiError } from '@/services/api';

const api = {
  getBooking: vi.fn(),
  getRun: vi.fn(),
  paySimulated: vi.fn(),
  paymentIntent: vi.fn(),
  cancellationQuote: vi.fn(),
  cancelBooking: vi.fn(),
  newIdempotencyKey: vi.fn(),
};
vi.mock('@/services/bookingService', () => ({
  getBooking: (...a: unknown[]) => api.getBooking(...a),
  getRun: (...a: unknown[]) => api.getRun(...a),
  paySimulated: (...a: unknown[]) => api.paySimulated(...a),
  paymentIntent: (...a: unknown[]) => api.paymentIntent(...a),
  cancellationQuote: (...a: unknown[]) => api.cancellationQuote(...a),
  cancelBooking: (...a: unknown[]) => api.cancelBooking(...a),
  newIdempotencyKey: () => api.newIdempotencyKey(),
}));
vi.mock('@/lib/booking/useStationNames', () => ({
  useStationNames: () => ({}),
  stationLabel: (c: string) => c,
}));

const base = {
  pnr: '4123456789',
  trainRunId: 1,
  runDate: '2026-11-20',
  classCode: '3A',
  quotaCode: 'GN',
  fromSeq: 0,
  toSeq: 4,
  totalFare: 845,
  passengers: [
    {
      seqNo: 1,
      name: 'Asha',
      age: 30,
      gender: 'F',
      bookingStatus: 'CNF/B1/12',
      currentStatus: 'CNF/B1/12',
    },
  ],
};
const pending = {
  ...base,
  status: 'PENDING_PAYMENT',
  holdExpiresAt: new Date(Date.now() + 600000).toISOString(),
};
const run = {
  runId: 1,
  trainNo: '99001',
  runDate: '2026-11-20',
  status: 'SCHEDULED',
  bookingOpensAt: '',
  classes: ['3A'],
  stops: [],
};

describe('BookingDetail', () => {
  beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    api.getRun.mockResolvedValue(run);
  });

  it('simulated payment, then waits for the booking to be confirmed', async () => {
    api.getBooking
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(pending)
      .mockResolvedValue({ ...base, status: 'CONFIRMED' });
    api.paySimulated.mockResolvedValue({});
    render(<BookingDetail pnr="4123456789" />);
    fireEvent.click(
      await screen.findByRole('button', { name: /Pay ₹845.00 \(simulated\)/ })
    );
    await waitFor(
      () =>
        expect(screen.getByTestId('booking-status')).toHaveTextContent(
          'Booked'
        ),
      { timeout: 8000 }
    );
    expect(api.paySimulated).toHaveBeenCalledWith('4123456789', 'SUCCESS');
  }, 10000);

  it('with a real gateway, refuses to open a checkout page on a host that is not allowed', async () => {
    api.getBooking.mockResolvedValue(pending);
    api.paySimulated.mockRejectedValue(
      new ApiError(404, 'off', 'RES_SIMULATED_PAYMENTS_OFF')
    );
    api.paymentIntent.mockResolvedValue({
      checkoutUrl: 'https://evil.example/pay',
      amount: 845,
      paymentId: 'p',
      status: 'PENDING',
    });
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    render(<BookingDetail pnr="4123456789" />);
    fireEvent.click(await screen.findByRole('button', { name: /simulated/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('looked wrong');
    expect(assign).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('cancelling twice after a failure reuses the same idempotency key (no second refund)', async () => {
    api.getBooking.mockResolvedValue({ ...base, status: 'CONFIRMED' });
    api.cancellationQuote.mockResolvedValue({
      pnr: base.pnr,
      bookingStatus: 'CONFIRMED',
      totalPaid: 845,
      totalCharge: 180,
      refundAmount: 665,
    });
    api.newIdempotencyKey
      .mockReturnValueOnce('first-key-123456789')
      .mockReturnValue('other-key-123456789');
    api.cancelBooking
      .mockRejectedValueOnce(new ApiError(503, 'down'))
      .mockResolvedValue({});
    render(<BookingDetail pnr="4123456789" />);
    fireEvent.click(
      await screen.findByRole('button', { name: /Cancel booking/ })
    );
    expect(await screen.findByText(/refund ₹665.00/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Yes, cancel/ }));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: /Yes, cancel/ }));
    await waitFor(() => expect(api.cancelBooking).toHaveBeenCalledTimes(2));
    expect(api.cancelBooking.mock.calls.map((c) => c[1])).toEqual([
      'first-key-123456789',
      'first-key-123456789',
    ]);
  });
});
