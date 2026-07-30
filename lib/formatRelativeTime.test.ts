import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatRelativeTime } from './formatRelativeTime';

const NOW = new Date('2026-07-30T12:00:00.000Z').getTime();

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for timestamps under a minute old', () => {
    expect(formatRelativeTime(NOW - 30 * 1000)).toBe('just now');
    expect(formatRelativeTime(NOW)).toBe('just now');
  });

  it('formats minutes for 1-59 minutes old', () => {
    expect(formatRelativeTime(NOW - 5 * 60 * 1000)).toBe('5m ago');
    expect(formatRelativeTime(NOW - 59 * 60 * 1000)).toBe('59m ago');
  });

  it('formats hours for 1-23 hours old', () => {
    expect(formatRelativeTime(NOW - 3 * 60 * 60 * 1000)).toBe('3h ago');
    expect(formatRelativeTime(NOW - 23 * 60 * 60 * 1000)).toBe('23h ago');
  });

  it('formats days for 1-6 days old', () => {
    expect(formatRelativeTime(NOW - 2 * 24 * 60 * 60 * 1000)).toBe('2d ago');
    expect(formatRelativeTime(NOW - 6 * 24 * 60 * 60 * 1000)).toBe('6d ago');
  });

  it('falls back to a formatted date at 7+ days old', () => {
    const eightDaysAgo = NOW - 8 * 24 * 60 * 60 * 1000;
    const result = formatRelativeTime(eightDaysAgo);

    expect(result).not.toMatch(/ago$/);
    expect(result).toContain('2026');
  });

  it('clamps future timestamps to "just now" rather than a negative duration', () => {
    expect(formatRelativeTime(NOW + 60 * 1000)).toBe('just now');
  });
});
