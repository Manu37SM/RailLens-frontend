/**
 * Holds the admin API key (X-Admin-Key) entered on /admin, for the
 * duration of the browser tab only. Deliberately sessionStorage rather
 * than localStorage like authStore.ts uses for the user JWT: this key
 * gates a destructive, whole-database-affecting action (POST
 * /api/v1/admin/import - see RailwayDataImportService), so it's treated as
 * more sensitive than a regular login session and isn't persisted past
 * closing the tab. The operator re-enters it each session, which is a
 * deliberate bit of friction for an action this consequential.
 */
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'raillens-admin-key';

function readStoredKey(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

function getSnapshot(): string | null {
  return readStoredKey();
}

function getServerSnapshot(): string | null {
  return null;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function setAdminKey(key: string) {
  window.sessionStorage.setItem(STORAGE_KEY, key);
  notify();
}

export function clearAdminKey() {
  window.sessionStorage.removeItem(STORAGE_KEY);
  notify();
}

export function useAdminKey(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
