'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';

interface AssistantInputProps {
  onSend: (message: string) => void;
  autoFocus?: boolean;
}

export default function AssistantInput({
  onSend,
  autoFocus = false,
}: AssistantInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSend = () => {
    const message = input.trim();

    if (!message) {
      return;
    }

    onSend(message);
    setInput('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about trains, stations or journeys..."
          aria-label="Ask about trains, stations or journeys"
          className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-base sm:text-sm transition-colors outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <SendHorizontal size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
