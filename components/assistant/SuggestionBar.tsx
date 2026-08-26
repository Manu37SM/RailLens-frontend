'use client';
import ActionChips, { type ActionChip } from './ActionChips';
import { QuickAction } from './QuickActions';
interface SuggestionBarProps {
  suggestions: ActionChip[];
  onAction: (action: QuickAction) => void;
}
export default function SuggestionBar({
  suggestions,
  onAction,
}: SuggestionBarProps) {
  return (
    <ActionChips
      title="Suggested Actions"
      actions={suggestions}
      onAction={onAction}
    />
  );
}
