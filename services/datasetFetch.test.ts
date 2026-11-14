import { afterEach, describe, expect, it, vi } from 'vitest';
import { DATASET_REVALIDATE_SECONDS, datasetFetch } from './api';

describe('datasetFetch', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('asks Next to cache the answer for an hour and gives a sleeping backend time to wake', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ totalTrains: 1 }), { status: 200 })
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(datasetFetch('/stats')).resolves.toEqual({ totalTrains: 1 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/stats$/);
    expect(init.next).toEqual({ revalidate: DATASET_REVALIDATE_SECONDS });
    expect(DATASET_REVALIDATE_SECONDS).toBe(3600);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('turns a failure into an error (never a cached page)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'down' }), { status: 503 })
        )
    );
    await expect(datasetFetch('/stats')).rejects.toMatchObject({ status: 503 });
  });
});
