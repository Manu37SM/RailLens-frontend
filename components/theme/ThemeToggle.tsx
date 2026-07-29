'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="hover:bg-gray-100 dark:hover:bg-slate-800 flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
