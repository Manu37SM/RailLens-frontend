'use client';

import { useEffect, useState } from 'react';
import { Bot, X } from 'lucide-react';

import AssistantDialog from './AssistantDialog';

export default function AssistantFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (!isShortcut) return;

      event.preventDefault();

      setOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          open ? 'Close RailLens Assistant' : 'Open RailLens Assistant'
        }
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-orange-700 active:scale-95"
      >
        {open ? <X size={24} /> : <Bot size={24} />}
      </button>

      <AssistantDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
