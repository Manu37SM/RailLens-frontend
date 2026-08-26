import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageStore } from './createLocalStorageStore';
describe('createLocalStorageStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  it('returns the default value before anything is written', () => {
    const store = createLocalStorageStore<string[]>('test-key', []);
    expect(store.get()).toEqual([]);
  });
  it('set() persists to localStorage and updates the in-memory cache', () => {
    const store = createLocalStorageStore<string[]>('test-key', []);
    store.set(['a', 'b']);
    expect(store.get()).toEqual(['a', 'b']);
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toEqual([
      'a',
      'b',
    ]);
  });
  it('update() derives the next value from the current one', () => {
    const store = createLocalStorageStore<number[]>('counters', [1, 2]);
    store.update((current) => [...current, 3]);
    expect(store.get()).toEqual([1, 2, 3]);
  });
  it('re-renders subscribed components via useStore() when set() is called', () => {
    const store = createLocalStorageStore<string>('notify-key', 'initial');
    const { result } = renderHook(() => store.useStore());
    expect(result.current).toBe('initial');
    act(() => {
      store.set('changed');
    });
    expect(result.current).toBe('changed');
  });
  it('falls back to the default value when stored JSON is corrupt', () => {
    window.localStorage.setItem('bad-json', '{not valid json');
    const store = createLocalStorageStore<{
      ok: boolean;
    }>('bad-json', {
      ok: true,
    });
    expect(store.get()).toEqual({ ok: true });
  });
  it('keeps separate storage keys fully independent', () => {
    const storeA = createLocalStorageStore<string>('key-a', 'a-default');
    const storeB = createLocalStorageStore<string>('key-b', 'b-default');
    storeA.set('a-value');
    expect(storeA.get()).toBe('a-value');
    expect(storeB.get()).toBe('b-default');
  });
});
