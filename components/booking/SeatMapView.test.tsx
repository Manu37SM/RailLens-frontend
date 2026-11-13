import { render, screen, fireEvent, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SeatMapView, { SEAT_MAP_REFRESH_MS } from './SeatMapView';
import { preferenceOptions } from './BookingForm';

const getSeatMap = vi.fn();
vi.mock('@/services/bookingService', () => ({
  getSeatMap: (...a: unknown[]) => getSeatMap(...a),
}));

const map = (b1: string) => ({
  runId: 1,
  classCode: '3A',
  fromSeq: 0,
  toSeq: 3,
  coaches: [
    {
      label: 'B1',
      free: b1 === 'FREE' ? 2 : 1,
      berths: [
        { no: 1, type: 'LB', state: b1 },
        { no: 2, type: 'MB', state: 'FREE' },
      ],
    },
    { label: 'B2', free: 1, berths: [{ no: 1, type: 'LB', state: 'FREE' }] },
  ],
});

describe('SeatMapView (Phase 6)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getSeatMap.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('shows each coach with its free count, and the berths of the chosen coach', async () => {
    getSeatMap.mockResolvedValue(map('TAKEN'));
    render(<SeatMapView runId={1} travelClass="3A" fromSeq={0} toSeq={3} />);
    expect(
      await screen.findByRole('tab', { name: 'B1 · 1 free' })
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('B1 1, Lower, taken')).toHaveAttribute(
      'data-state',
      'TAKEN'
    );
    fireEvent.click(screen.getByRole('tab', { name: 'B2 · 1 free' }));
    expect(screen.getByLabelText('B2 1, Lower, free')).toBeInTheDocument();
    expect(getSeatMap).toHaveBeenCalledWith(1, '3A', 0, 3);
  });

  it('refreshes by itself, so berths fill as others book', async () => {
    getSeatMap
      .mockResolvedValueOnce(map('FREE'))
      .mockResolvedValue(map('TAKEN'));
    render(<SeatMapView runId={1} travelClass="3A" fromSeq={0} toSeq={3} />);
    expect(
      await screen.findByLabelText('B1 1, Lower, free')
    ).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SEAT_MAP_REFRESH_MS);
    });
    expect(
      await screen.findByLabelText('B1 1, Lower, taken')
    ).toBeInTheDocument();
  });

  it('preference choices match the coach: seats for chair cars, berths for sleepers', () => {
    expect(preferenceOptions('CC')).toEqual(['WS', 'MS', 'AS']);
    expect(preferenceOptions('EC')).toEqual(['WS', 'AS']);
    expect(preferenceOptions('1A')).toEqual(['LB', 'UB']);
    expect(preferenceOptions('SL')).toContain('SU');
    expect(preferenceOptions('3A')).not.toContain('SL'); // side lowers are kept for RAC
  });
});
