'use client';
import { useEffect } from 'react';
export function useGlobalSearchShortcut() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
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
