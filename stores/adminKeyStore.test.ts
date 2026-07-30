import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { clearAdminKey, setAdminKey, useAdminKey } from './adminKeyStore';

describe('adminKeyStore', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('useAdminKey() returns null when nothing is set', () => {
    const { result } = renderHook(() => useAdminKey());
    expect(result.current).toBeNull();
  });

  it('setAdminKey() persists to sessionStorage (not localStorage)', () => {
    setAdminKey('super-secret');

    expect(window.sessionStorage.getItem('raillens-admin-key')).toBe('super-secret');
    expect(window.localStorage.getItem('raillens-admin-key')).toBeNull();
  });

  it('useAdminKey() reflects the current key and updates on change', () => {
    const { result } = renderHook(() => useAdminKey());

    act(() => {
      setAdminKey('super-secret');
    });
    expect(result.current).toBe('super-secret');

    act(() => {
      clearAdminKey();
    });
    expect(result.current).toBeNull();
  });
});
