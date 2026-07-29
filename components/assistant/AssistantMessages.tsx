'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';

import type { AssistantMessage } from './AssistantDialog';

interface AssistantMessagesProps {
  messages: AssistantMessage[];
  isTyping: boolean;
}

export default function AssistantMessages({
  messages,
  isTyping,
}: AssistantMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 dark:bg-slate-800 p-4">
      {messages.map((message) => {
        const isAssistant = message.role === 'assistant';

        return (
          <div
            key={message.id}
            className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`flex max-w-[85%] items-end gap-2 ${
                isAssistant ? '' : 'flex-row-reverse'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isAssistant
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {isAssistant ? <Bot size={16} /> : <User size={16} />}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  isAssistant
                    ? 'rounded-bl-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100'
                    : 'rounded-br-md bg-orange-600 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex justify-start">
          <div className="flex items-end gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white">
              <Bot size={16} />
            </div>

            <div className="rounded-2xl rounded-bl-md bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-slate-600" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-slate-600 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-slate-600 [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
