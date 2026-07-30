import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement window.matchMedia at all (throws "not
// implemented" if called) - lib/theme.ts and any future
// prefers-color-scheme/prefers-reduced-motion check needs a default so
// tests that don't care about the result (most of them) don't have to stub
// it individually. Defaults to "no match" (light mode / no reduced
// motion); tests that specifically care about a match override this with
// vi.stubGlobal per-test, same pattern as lib/theme.test.ts.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
