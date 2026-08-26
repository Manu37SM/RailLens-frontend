import { useEffect, useSyncExternalStore } from 'react';
export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
const STORAGE_KEY = 'raillens-theme';
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
}
function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}
function applyResolvedTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}
function getSnapshot(): ThemePreference {
  return readStoredPreference();
}
function getServerSnapshot(): ThemePreference {
  return 'system';
}
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (readStoredPreference() === 'system') {
      applyResolvedTheme(resolveTheme('system'));
      callback();
    }
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
export function setTheme(preference: ThemePreference) {
  window.localStorage.setItem(STORAGE_KEY, preference);
  applyResolvedTheme(resolveTheme(preference));
  notify();
}
export function useTheme(): [
  ThemePreference,
  (preference: ThemePreference) => void,
] {
  const preference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  useEffect(() => {
    applyResolvedTheme(resolveTheme(preference));
  });
  return [preference, setTheme];
}
