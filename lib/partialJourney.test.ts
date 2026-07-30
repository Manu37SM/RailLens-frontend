import { describe, expect, it } from 'vitest';

import { computePartialJourney, formatPartialDuration } from './partialJourney';
import { RouteStopResponse } from '@/types/train';

function stop(overrides: Partial<RouteStopResponse>): RouteStopResponse {
  return {
    sequenceNo: 0,
    stationCode: 'XXX',
    stationName: 'Test Station',
    arrivalTime: null,
    departureTime: null,
    distance: null,
    distanceFromPrevious: null,
    haltMinutes: 0,
    journeyDay: 1,
    origin: false,
    destination: false,
    ...overrides,
  };
}

describe('computePartialJourney', () => {
  it('computes distance and duration between two stops in order', () => {
    const boarding = stop({
      sequenceNo: 1,
      distance: 0,
      departureTime: '08:00',
      journeyDay: 1,
    });
    const deboarding = stop({
      sequenceNo: 5,
      distance: 500,
      arrivalTime: '14:30',
      journeyDay: 1,
    });

    const result = computePartialJourney(boarding, deboarding);

    expect(result).toEqual({ distanceKm: 500, durationMinutes: 390 });
  });

  it('handles stops passed in reverse order the same as forward order', () => {
    const boarding = stop({ sequenceNo: 1, distance: 0, departureTime: '08:00' });
    const deboarding = stop({ sequenceNo: 5, distance: 500, arrivalTime: '14:30' });

    const forward = computePartialJourney(boarding, deboarding);
    const reversed = computePartialJourney(deboarding, boarding);

    expect(reversed).toEqual(forward);
  });

  it('returns null when boarding and de-boarding are the same stop', () => {
    const same = stop({ sequenceNo: 3 });
    expect(computePartialJourney(same, same)).toBeNull();
  });

  it('accounts for a midnight rollover via journeyDay', () => {
    const boarding = stop({
      sequenceNo: 1,
      distance: 0,
      departureTime: '23:30',
      journeyDay: 1,
    });
    const deboarding = stop({
      sequenceNo: 2,
      distance: 100,
      arrivalTime: '01:15',
      journeyDay: 2,
    });

    const result = computePartialJourney(boarding, deboarding);

    // 30 min to midnight + 75 min into day 2 = 105 minutes.
    expect(result).toEqual({ distanceKm: 100, durationMinutes: 105 });
  });

  it('falls back to 0 distance when either stop is missing distance data', () => {
    const boarding = stop({ sequenceNo: 1, distance: null, departureTime: '08:00' });
    const deboarding = stop({ sequenceNo: 2, distance: 100, arrivalTime: '09:00' });

    const result = computePartialJourney(boarding, deboarding);

    expect(result?.distanceKm).toBe(0);
  });

  it('returns null duration when times are missing', () => {
    const boarding = stop({ sequenceNo: 1, distance: 0 });
    const deboarding = stop({ sequenceNo: 2, distance: 100 });

    const result = computePartialJourney(boarding, deboarding);

    expect(result?.durationMinutes).toBeNull();
  });

  it('falls back arrival/departure to the other time field when one is missing', () => {
    const boarding = stop({ sequenceNo: 1, distance: 0, arrivalTime: '08:00', departureTime: null });
    const deboarding = stop({ sequenceNo: 2, distance: 50, departureTime: '09:00', arrivalTime: null });

    const result = computePartialJourney(boarding, deboarding);

    expect(result).toEqual({ distanceKm: 50, durationMinutes: 60 });
  });
});

describe('formatPartialDuration', () => {
  it('formats minutes as "Xh Ym"', () => {
    expect(formatPartialDuration(390)).toBe('6h 30m');
    expect(formatPartialDuration(45)).toBe('0h 45m');
    expect(formatPartialDuration(0)).toBe('0h 0m');
  });

  it('returns a placeholder for null', () => {
    expect(formatPartialDuration(null)).toBe('--');
  });
});
