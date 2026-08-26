'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
interface CodeBlockProps {
  code: string;
  language?: string;
}
export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <div className="relative rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
      {language && (
        <div className="border-b border-slate-200 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
          {language}
        </div>
      )}

      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        title={copied ? 'Copied' : 'Copy'}
        className="absolute top-2 right-2 rounded-md border border-slate-300 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        {copied ? (
          <Check
            size={14}
            className="text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
      </button>

      <pre className="overflow-x-auto p-4 pr-10 text-sm">
        <code className="font-mono text-slate-800 dark:text-slate-200">
          {code}
        </code>
      </pre>
    </div>
  );
}
