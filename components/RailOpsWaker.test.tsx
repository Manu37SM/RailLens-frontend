import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RailOpsWaker from './RailOpsWaker';

describe('RailOpsWaker', () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 202 }));
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    fetchMock.mockClear();
    vi.unstubAllGlobals();
  });

  it('asks this site to wake RailOps once, then not again for a few minutes', () => {
    const first = render(<RailOpsWaker />);
    expect(first.container.innerHTML).toBe('');
    expect(fetchMock).toHaveBeenCalledWith('/api/railops/wake', {
      method: 'POST',
      keepalive: true,
    });
    render(<RailOpsWaker />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('wakes again after the interval', () => {
    sessionStorage.setItem(
      'raillens-railops-woken-at',
      String(Date.now() - 5 * 60 * 1000)
    );
    render(<RailOpsWaker />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
