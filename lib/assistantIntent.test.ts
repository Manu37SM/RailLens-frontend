import { describe, expect, it } from 'vitest';

import { buildAssistantResponse, resolveIntent } from './assistantIntent';
import { Favorite } from '@/types/favorite';
import { RecentSearch } from '@/types/recentSearch';

// Previously untestable in isolation - this logic lived entirely inside
// AssistantDialog.tsx. Now that it's a plain module, these cover the
// regex-based intent-matching edge cases the frontend architecture review
// flagged as "real, non-trivial logic... worth testing."

describe('resolveIntent', () => {
  it('recognizes a 5-digit train number', () => {
    expect(resolveIntent('12951')).toEqual({
      type: 'train',
      trainNumber: '12951',
    });
  });

  it('does not treat a 4 or 6 digit number as a train number', () => {
    expect(resolveIntent('1234').type).toBe('unknown');
    expect(resolveIntent('123456').type).toBe('unknown');
  });

  it('recognizes a 2-5 letter station code, uppercasing it', () => {
    expect(resolveIntent('ndls')).toEqual({
      type: 'station',
      stationCode: 'NDLS',
    });
    expect(resolveIntent('kyn')).toEqual({
      type: 'station',
      stationCode: 'KYN',
    });
  });

  it('recognizes an "X to Y" journey query', () => {
    expect(resolveIntent('Mumbai to Pune')).toEqual({
      type: 'journey',
      from: 'Mumbai',
      to: 'Pune',
    });
  });

  it('trims whitespace around journey endpoints', () => {
    expect(resolveIntent('  New Delhi   to   Howrah  ')).toEqual({
      type: 'journey',
      from: 'New Delhi',
      to: 'Howrah',
    });
  });

  it('recognizes "favorite"/"favorites" mentions', () => {
    expect(resolveIntent('show my favorites')).toEqual({ type: 'favorites' });
  });

  it('recognizes "recent" mentions', () => {
    expect(resolveIntent('recent searches')).toEqual({ type: 'recent' });
  });

  it('recognizes help requests', () => {
    expect(resolveIntent('help')).toEqual({ type: 'help' });
    expect(resolveIntent('what can you do')).toEqual({ type: 'help' });
  });

  it('maps train-search phrasing to the trains help topic', () => {
    expect(resolveIntent('how do I search trains?')).toEqual({
      type: 'unknown',
      query: 'help:trains',
    });
  });

  it('maps station-search phrasing to the stations help topic', () => {
    expect(resolveIntent('find a station')).toEqual({
      type: 'unknown',
      query: 'help:stations',
    });
  });

  it('maps journey-planning phrasing to the journey help topic', () => {
    expect(resolveIntent('plan my trip')).toEqual({
      type: 'unknown',
      query: 'help:journey',
    });
  });

  it('maps "raillens" mentions to the raillens help topic', () => {
    expect(resolveIntent('what is raillens?')).toEqual({
      type: 'unknown',
      query: 'help:raillens',
    });
  });

  it('falls back to an unknown action carrying the raw query', () => {
    expect(resolveIntent('asdkjfh')).toEqual({
      type: 'unknown',
      query: 'asdkjfh',
    });
  });

  // "Railway Intelligence" feature set (added after the original five
  // intents above) - see FEATURE.md.
  it('recognizes rankings requests', () => {
    expect(resolveIntent('show me the rankings')).toEqual({ type: 'rankings' });
  });

  it('recognizes fun facts requests', () => {
    expect(resolveIntent('any fun facts?')).toEqual({ type: 'funFacts' });
  });

  it('recognizes achievements requests', () => {
    expect(resolveIntent('open achievements')).toEqual({ type: 'achievements' });
  });

  it('recognizes railway network requests', () => {
    expect(resolveIntent('show the railway network')).toEqual({ type: 'network' });
  });

  it('recognizes statistics requests', () => {
    expect(resolveIntent('show statistics')).toEqual({ type: 'stats' });
    expect(resolveIntent('dataset health')).toEqual({ type: 'stats' });
  });

  it('recognizes smart search requests', () => {
    expect(resolveIntent('open smart search')).toEqual({ type: 'smartSearch' });
  });

  it('recognizes admin portal requests', () => {
    expect(resolveIntent('open admin panel')).toEqual({ type: 'admin' });
  });

  it('recognizes account requests', () => {
    expect(resolveIntent('open my account')).toEqual({ type: 'account' });
  });

  it('recognizes developers page requests', () => {
    expect(resolveIntent('show developer docs')).toEqual({ type: 'developers' });
  });

  it('recognizes saved journeys requests', () => {
    expect(resolveIntent('show saved journeys')).toEqual({ type: 'savedJourneys' });
  });

  it('still treats a bare 2-5 letter word as a station code, not a new intent (pre-existing trade-off)', () => {
    // "stats" and "admin" are both 5 letters, so a *bare* word still hits
    // the station-code regex first, same as "help" already does - only
    // longer/multi-word phrasing reaches the new intents above.
    expect(resolveIntent('stats')).toEqual({ type: 'station', stationCode: 'STATS' });
    expect(resolveIntent('admin')).toEqual({ type: 'station', stationCode: 'ADMIN' });
  });
});

describe('buildAssistantResponse', () => {
  const favorites: Favorite[] = [
    { type: 'train', trainNumber: '12951', trainName: 'Mumbai Rajdhani' },
    { type: 'station', stationCode: 'NDLS', stationName: 'New Delhi' },
    {
      type: 'route',
      fromStationCode: 'NDLS',
      fromStationName: 'New Delhi',
      toStationCode: 'HWH',
      toStationName: 'Howrah Jn',
    },
  ];

  const recentSearches: RecentSearch[] = [
    {
      type: 'train',
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani',
      timestamp: 1,
    },
    { type: 'station', stationCode: 'NDLS', stationName: 'New Delhi', timestamp: 2 },
    {
      type: 'journey',
      fromCode: 'NDLS',
      fromName: 'New Delhi',
      toCode: 'HWH',
      toName: 'Howrah Jn',
      timestamp: 3,
    },
  ];

  it('reports no favorites when the list is empty', () => {
    const response = buildAssistantResponse({ type: 'favorites' }, [], []);
    expect(response.message).toBe('You have no favorite trains or stations.');
  });

  it('lists every favorite type, including routes', () => {
    const response = buildAssistantResponse({ type: 'favorites' }, favorites, []);
    expect(response.message).toContain('12951');
    expect(response.message).toContain('NDLS');
    expect(response.message).toContain('New Delhi → Howrah Jn');
  });

  it('reports no recent searches when the list is empty', () => {
    const response = buildAssistantResponse({ type: 'recent' }, [], []);
    expect(response.message).toBe('You have no recent searches.');
  });

  it('lists every recent-search type', () => {
    const response = buildAssistantResponse({ type: 'recent' }, [], recentSearches);
    expect(response.message).toContain('12951');
    expect(response.message).toContain('NDLS');
    expect(response.message).toContain('New Delhi → Howrah Jn');
  });

  it('closes the assistant after a train/station/journey action', () => {
    expect(
      buildAssistantResponse({ type: 'train', trainNumber: '12951' }, [], [])
        .closeAfterAction
    ).toBe(true);
    expect(
      buildAssistantResponse({ type: 'station', stationCode: 'NDLS' }, [], [])
        .closeAfterAction
    ).toBe(true);
  });

  it('does not close the assistant for informational actions', () => {
    expect(
      buildAssistantResponse({ type: 'help' }, [], []).closeAfterAction
    ).toBeUndefined();
  });

  it('resolves each help: sub-topic to its matching help text', () => {
    expect(
      buildAssistantResponse({ type: 'unknown', query: 'help:trains' }, [], [])
        .message
    ).toContain('Train Search page');
    expect(
      buildAssistantResponse({ type: 'unknown', query: 'help:stations' }, [], [])
        .message
    ).toContain('Station Search page');
  });

  it('falls back to a generic message for an unrecognized query', () => {
    expect(
      buildAssistantResponse({ type: 'unknown', query: 'asdkjfh' }, [], [])
        .message
    ).toContain("didn't quite understand");
  });
});
