import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BackendStatusBanner, {
  formatCountdown,
  RETURN_CHECK_AFTER_MS,
} from './BackendStatusBanner';
import { createBackendStatusStore } from '@/lib/backendStatus/store';

function storeAnswering(answer: 'waking' | 'down' | 'up') {
  return createBackendStatusStore({
    probe: async () => answer,
    now: () => Date.now(),
    schedule: () => 0,
    cancel: () => {},
  });
}

describe('BackendStatusBanner', () => {
  it('shows nothing while everything works', () => {
    const { container } = render(
      <BackendStatusBanner store={storeAnswering('up')} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('waking up: says so, with a countdown', async () => {
    const store = storeAnswering('waking');
    render(<BackendStatusBanner store={store} />);
    await act(async () => store.report('raillens'));
    const bar = screen.getByTestId('backend-status-raillens');
    expect(bar).toHaveTextContent('RailLens is waking up');
    expect(bar).toHaveTextContent(/Ready in about [01]:\d\d/);
  });

  it('down: tells the visitor to try again later', async () => {
    let fired = 0;
    const store = createBackendStatusStore({
      probe: async () => 'down',
      now: () => Date.now(),
      // run the first follow-up check at once, then stop (enough for "two 5xx in a row")
      schedule: (fn) => (fired++ === 0 ? setTimeout(fn, 0) : 0),
      cancel: () => {},
    });
    render(<BackendStatusBanner store={store} />);
    await act(async () => {
      store.report('railops');
      await new Promise((r) => setTimeout(r, 20));
    });
    const bar = screen.getByTestId('backend-status-railops');
    expect(bar).toHaveTextContent('Booking (RailOps) is down right now');
    expect(bar).toHaveTextContent('Please try again later');
    expect(
      screen.getByRole('button', { name: 'Check now' })
    ).toBeInTheDocument();
  });

  it('back: offers to try again', async () => {
    const store = storeAnswering('up');
    render(<BackendStatusBanner store={store} />);
    await act(async () => store.report('raillens'));
    expect(screen.getByTestId('backend-status-raillens')).toHaveTextContent(
      'RailLens is back'
    );
    expect(
      screen.getByRole('button', { name: 'Try again' })
    ).toBeInTheDocument();
  });

  it('formats the countdown', () => {
    expect(formatCountdown(61_000)).toBe('1:01');
    expect(formatCountdown(9_400)).toBe('0:10');
    expect(formatCountdown(-5)).toBe('0:00');
  });

  it('coming back to the tab after a while checks quietly, and warns if RailLens went down meanwhile', async () => {
    const store = storeAnswering('waking');
    render(<BackendStatusBanner store={store} />);
    const visibility = vi.spyOn(document, 'visibilityState', 'get');
    const now = vi.spyOn(Date, 'now');
    now.mockReturnValue(1_000_000);
    visibility.mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    now.mockReturnValue(1_000_000 + RETURN_CHECK_AFTER_MS);
    visibility.mockReturnValue('visible');
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(screen.getByTestId('backend-status-raillens')).toHaveTextContent(
      'RailLens is waking up'
    );
    now.mockRestore();
    visibility.mockRestore();
  });
});
