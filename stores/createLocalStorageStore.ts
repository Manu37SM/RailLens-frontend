'use client';
import { useSyncExternalStore } from 'react';
type Listener = () => void;
export function createLocalStorageStore<T>(
  storageKey: string,
  defaultValue: T
) {
  let cache = defaultValue;
  let initialized = false;
  const listeners = new Set<Listener>();
  function readStorage(): T {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return defaultValue;
      }
      return JSON.parse(stored) as T;
    } catch (error) {
      console.error(`Failed to read "${storageKey}"`, error);
      return defaultValue;
    }
  }
  function writeStorage(value: T) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write "${storageKey}"`, error);
    }
  }
  function emit() {
    listeners.forEach((listener) => listener());
  }
  function subscribe(listener: Listener) {
    listeners.add(listener);
    if (!initialized) {
      initialized = true;
      const next = readStorage();
      if (JSON.stringify(next) !== JSON.stringify(cache)) {
        cache = next;
        queueMicrotask(emit);
      }
    }
    function handleStorage(event: StorageEvent) {
      if (event.key !== storageKey) {
        return;
      }
      cache = readStorage();
      emit();
    }
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', handleStorage);
    };
  }
  function getSnapshot() {
    return cache;
  }
  function getServerSnapshot() {
    return defaultValue;
  }
  function set(value: T) {
    cache = value;
    initialized = true;
    writeStorage(value);
    emit();
  }
  function update(updater: (current: T) => T) {
    set(updater(cache));
  }
  function get() {
    return cache;
  }
  function useStore() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }
  return {
    useStore,
    get,
    set,
    update,
  };
}
