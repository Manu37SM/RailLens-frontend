import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setTheme, useTheme } from './theme';
describe('theme store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });
  it('setTheme("dark") adds the .dark class to <html> and persists the choice', () => {
    setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('raillens-theme')).toBe('dark');
  });
  it('setTheme("light") removes the .dark class', () => {
    setTheme('dark');
    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('raillens-theme')).toBe('light');
  });
  it('useTheme() reflects the stored preference and re-renders on change', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('system');
    act(() => {
      result.current[1]('dark');
    });
    expect(result.current[0]).toBe('dark');
  });
  it('falls back to system preference when nothing is stored', () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('matchMedia', matchMediaMock);
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    vi.unstubAllGlobals();
  });
  it('setTheme("system") is a real, persisted choice - not just clearing the stored value', () => {
    setTheme('dark');
    setTheme('system');
    expect(window.localStorage.getItem('raillens-theme')).toBe('system');
  });
  it('a live OS theme change is reflected while preference is "system"', () => {
    let changeHandler: (() => void) | undefined;
    let matches = false;
    const matchMediaMock = vi.fn().mockReturnValue({
      get matches() {
        return matches;
      },
      addEventListener: (_event: string, handler: () => void) => {
        changeHandler = handler;
      },
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('matchMedia', matchMediaMock);
    setTheme('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('system');
    matches = true;
    act(() => {
      changeHandler?.();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    vi.unstubAllGlobals();
  });
  it('a live OS theme change is ignored once an explicit light/dark preference is set', () => {
    let changeHandler: (() => void) | undefined;
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (_event: string, handler: () => void) => {
        changeHandler = handler;
      },
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('matchMedia', matchMediaMock);
    setTheme('light');
    renderHook(() => useTheme());
    act(() => {
      changeHandler?.();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('raillens-theme')).toBe('light');
    vi.unstubAllGlobals();
  });
});
