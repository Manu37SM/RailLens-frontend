'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Bot, X } from 'lucide-react';

// AssistantFab renders on every page via the root layout, but most visits
// never open the assistant. Loading AssistantDialog's code (message list,
// input, quick actions, conversation state) eagerly would put all of that
// in the initial JS bundle for every page load regardless of whether
// anyone ever clicks the button. next/dynamic defers fetching that chunk
// until it's actually rendered - paired below with `{open && <AssistantDialog
// .../>}` (rather than always rendering it and letting it return null
// internally) so the chunk is only requested the first time someone opens
// it, not on every page load. ssr: false is safe here since the dialog
// only exists as an interactive client-side overlay - there's nothing for
// the server to render.
const AssistantDialog = dynamic(() => import('./AssistantDialog'), {
  ssr: false,
});

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
        aria-expanded={open}
        aria-haspopup="dialog"
        className="focus-visible:ring-primary fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg transition-colors duration-200 hover:bg-orange-700 focus-visible:ring-2 focus-visible:outline-none sm:right-6 sm:bottom-6"
      >
        {open ? <X size={24} aria-hidden="true" /> : <Bot size={24} aria-hidden="true" />}
      </button>

      {open && (
        <AssistantDialog open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
