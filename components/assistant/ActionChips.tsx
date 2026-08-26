'use client';
import type { LucideIcon } from 'lucide-react';
import type { QuickAction } from './QuickActions';
export interface ActionChip {
  label: string;
  icon: LucideIcon;
  action: QuickAction;
}
interface ActionChipsProps {
  title: string;
  actions: ActionChip[];
  onAction: (action: QuickAction) => void;
}
export default function ActionChips({
  title,
  actions,
  onAction,
}: ActionChipsProps) {
  if (actions.length === 0) {
    return null;
  }
  return (
    <div className="border-t border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400">
        {title}
      </p>

      <div className="flex flex-wrap gap-2">
        {actions.map(({ icon: Icon, label, action }) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
