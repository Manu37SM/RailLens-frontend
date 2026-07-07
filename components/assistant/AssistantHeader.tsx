'use client';

import { Bot, X } from 'lucide-react';

interface AssistantHeaderProps {
  onClose: () => void;
}

export default function AssistantHeader({ onClose }: AssistantHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-orange-600 px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Bot size={22} />
        </div>

        <div>
          <h2 className="text-sm font-semibold">RailLens Assistant</h2>
          <p className="text-xs text-orange-100">
            Find trains, stations and journeys
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close assistant"
        className="rounded-md p-2 transition-colors hover:bg-white/10"
      >
        <X size={20} />
      </button>
    </header>
  );
}
