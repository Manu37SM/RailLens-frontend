'use client';
import { useState } from 'react';
import { AlertCircle, Check, Share2 } from 'lucide-react';
interface ShareButtonProps {
  title: string;
  text: string;
  path: string;
}
export default function ShareButton({ title, text, path }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  async function handleShare() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  }
  return (
    <button
      type="button"
      onClick={handleShare}
      title={
        copyFailed
          ? "Couldn't copy link - copy the URL from your address bar instead"
          : 'Share'
      }
      aria-label={
        copied ? 'Link copied' : copyFailed ? 'Could not copy link' : 'Share'
      }
      className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {copied ? (
        <Check
          size={18}
          className="text-green-600 dark:text-green-400"
          aria-hidden="true"
        />
      ) : copyFailed ? (
        <AlertCircle
          size={18}
          className="text-red-600 dark:text-red-400"
          aria-hidden="true"
        />
      ) : (
        <Share2 size={18} aria-hidden="true" />
      )}
    </button>
  );
}
