/**
 * Minimal theme store: no new dependency (e.g. next-themes) was added for
 * this — the app only needs "toggle a class on <html> and remember the
 * choice", which useSyncExternalStore already covers cleanly, matching the
 * pattern already used elsewhere in this codebase for localStorage-backed
 * state.
 */
import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'raillens-theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function getSnapshot(): Theme {
  return readStoredTheme() ?? getSystemTheme();
}

function getServerSnapshot(): Theme {
  // Matches the inline script in the root layout, which also defaults to
  // 'light' before the stored/system preference can be read on the client.
  return 'light';
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (!readStoredTheme()) callback();
  };
  mediaQuery.addEventListener('change', onSystemChange);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(callback);
    mediaQuery.removeEventListener('change', onSystemChange);
    window.removeEventListener('storage', onStorage);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function setTheme(theme: Theme) {
  window.localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  notify();
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return [theme, setTheme];
}
