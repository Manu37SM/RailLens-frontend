'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { ComponentType } from 'react';

import { useTheme, type ThemePreference } from '@/lib/theme';

const OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
}[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System default', icon: Monitor },
];

/**
 * A real three-way choice, not a single toggle - see lib/theme.ts's
 * javadoc-equivalent comment for why "System default" has to be an
 * explicit, re-selectable option rather than just the fallback before a
 * user's first click.
 */
export default function ThemeToggle() {
  const [preference, setTheme] = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5 dark:border-slate-700"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = preference === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              selected
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={16} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
