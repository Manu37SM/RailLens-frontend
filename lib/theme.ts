/**
 * Minimal theme store: no new dependency (e.g. next-themes) was added for
 * this — the app only needs "toggle a class on <html> and remember the
 * choice", which useSyncExternalStore already covers cleanly, matching the
 * pattern already used elsewhere in this codebase for localStorage-backed
 * state.
 *
 * ThemePreference has three values, not two - 'system' is a real, savable
 * choice, not just "nothing saved yet". The original version only ever
 * stored 'light'/'dark': system preference was merely the fallback used
 * before any explicit choice existed, so the moment a user clicked the
 * toggle once, that choice was permanent and there was no way back to
 * "follow my OS theme" short of manually clearing localStorage - reported
 * 2026-08-03 as "System Default isn't working". Storing 'system' itself
 * fixes that: picking it is a real, persisted preference the user can
 * return to at any time.
 */
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
  // Matches the inline script in the root layout, which also treats
  // "system" as the default before the stored preference can be read on
  // the client.
  return 'system';
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  // Only matters while the stored preference is 'system' - re-notifies so
  // useTheme() re-renders (and, via its render-time applyResolvedTheme call
  // below, re-applies the actual .dark class) when the OS theme flips while
  // this preference is active. The previous version only ever called
  // applyTheme() from the imperative setTheme() setter, so a live OS theme
  // change while nothing was explicitly chosen updated what useTheme()
  // returned without ever touching the DOM class that controls the visible
  // theme - a second, quieter half of the same "System Default isn't
  // working" report.
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (readStoredPreference() === 'system') callback();
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

export function useTheme(): [ThemePreference, (preference: ThemePreference) => void] {
  const preference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Applying the DOM class during render (rather than in an effect) meant
  // this ran on React's very first hydration pass too - the pass where
  // useSyncExternalStore is required to return getServerSnapshot()'s fixed
  // 'system' value regardless of what's actually in localStorage, so a
  // real stored 'dark'/'light' preference got clobbered by a live
  // matchMedia() read the instant hydration committed - the flash of
  // correct theme (from the inline script in the root layout), followed by
  // a re-render that snapped it back to the OS preference, reported
  // 2026-08-05 as "loads dark, restarts, then switches to light".
  //
  // A useEffect fixes that (effects never run during the render React
  // uses to match server output - only after commit, once `preference`
  // already holds the real client value), but deliberately still has no
  // dependency array rather than `[preference]`: while preference stays
  // 'system' and only the OS theme flips, `preference` itself never
  // changes, so a `[preference]` dependency array would skip re-applying
  // the class on exactly the case this exists to fix (see subscribe()
  // above). Running this after every render this hook produces is cheap
  // (toggling a class that's already correct is a no-op) and guarantees
  // the DOM always matches the current resolved theme, including
  // immediately after a system-change event triggers a re-render.
  useEffect(() => {
    applyResolvedTheme(resolveTheme(preference));
  });

  return [preference, setTheme];
}
