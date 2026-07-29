'use client';

import { useEffect } from 'react';

/**
 * Global "/" shortcut (mirrors GitHub, Linear, M-Indicator-style apps) that
 * focuses whichever input on the current page is marked
 * `data-global-search` - see StationAutocomplete's `shortcutTarget` prop
 * and SearchBar.tsx. Deliberately page-agnostic rather than routing
 * somewhere: pages with no marked input (e.g. the home page, which is all
 * link tiles) just do nothing, rather than surprising the user with a
 * navigation they didn't ask for.
 *
 * Mounted once in RootLayout (see components/pwa/... sibling pattern) -
 * not per-page - so it works everywhere without every page needing to
 * remember to wire it up.
 */
export function useGlobalSearchShortcut() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;

      // Don't hijack "/" while the user is already typing somewhere -
      // inputs, textareas, and contenteditable regions all need to accept
      // a literal "/" character normally.
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      const searchInput = document.querySelector<HTMLInputElement>(
        '[data-global-search]'
      );

      if (!searchInput) return;

      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
