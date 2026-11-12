import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BookTrainCard from './BookTrainCard';

const findRun = vi.fn();
const getAvailability = vi.fn();
vi.mock('@/services/bookingService', () => ({
  findRun: (...a: unknown[]) => findRun(...a),
  getAvailability: (...a: unknown[]) => getAvailability(...a),
}));
vi.mock('@/stores/authStore', () => ({
  useAuthSession: () => ({ username: 'asha', email: 'a@x.in' }),
}));

const route = ['MMCT', 'BVI', 'ST', 'BRC', 'NDLS'].map((code, i) => ({
  sequenceNo: i + 1,
  stationCode: code,
  stationName: code,
  arrivalTime: null,
  departureTime: null,
  distance: 0,
  distanceFromPrevious: 0,
  haltMinutes: 0,
  journeyDay: 1,
  origin: i === 0,
  destination: i === 4,
}));

describe('BookTrainCard', () => {
  beforeEach(() => {
    findRun.mockReset();
    getAvailability.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('is not shown until booking is switched on', () => {
    const { container } = render(
      <BookTrainCard trainNumber="99001" route={route} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('maps RailLens stations to RailOps stop numbers and links each bookable class', async () => {
    vi.stubEnv('NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER', 'railops');
    vi.stubEnv('NEXT_PUBLIC_RAILOPS_API_URL', 'https://railops.example');
    // RailOps numbers stops from 0 and may skip non-halts: never assume RailLens' numbering.
    findRun.mockResolvedValue({
      runId: 7,
      trainNo: '99001',
      stops: [
        { seq: 0, stationCode: 'MMCT' },
        { seq: 1, stationCode: 'ST' },
        { seq: 2, stationCode: 'BRC' },
        { seq: 3, stationCode: 'NDLS' },
      ],
    });
    getAvailability.mockResolvedValue({
      pools: [
        { classCode: '3A', quotaCode: 'GN', display: 'AVAILABLE-40' },
        { classCode: '3A', quotaCode: 'TQ', display: 'AVAILABLE-9' },
        { classCode: 'SL', quotaCode: 'GN', display: 'REGRET' },
      ],
    });
    render(<BookTrainCard trainNumber="99001" route={route} />);
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: 'ST' },
    });
    fireEvent.click(screen.getByRole('button', { name: /check seats/i }));
    const link = await screen.findByRole('link', { name: 'Book' });
    expect(getAvailability).toHaveBeenCalledWith(7, 1, 3);
    expect(link).toHaveAttribute('href', '/book?run=7&from=1&to=3&class=3A');
    expect(screen.getAllByRole('link', { name: 'Book' })).toHaveLength(1); // REGRET isn't bookable; Tatkal not shown
  });

  it('says so when a station is not a stop RailOps sells tickets for', async () => {
    vi.stubEnv('NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER', 'railops');
    vi.stubEnv('NEXT_PUBLIC_RAILOPS_API_URL', 'https://railops.example');
    findRun.mockResolvedValue({
      runId: 7,
      stops: [
        { seq: 0, stationCode: 'MMCT' },
        { seq: 3, stationCode: 'NDLS' },
      ],
    });
    render(<BookTrainCard trainNumber="99001" route={route} />);
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: 'BVI' },
    });
    fireEvent.click(screen.getByRole('button', { name: /check seats/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'doesn’t sell tickets'
    );
    expect(getAvailability).not.toHaveBeenCalled();
  });
});
