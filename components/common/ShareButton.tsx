'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  // Path only (e.g. "/trains/12345") - resolved against window.location.origin
  // at click time rather than passed as a full URL, so this works the same
  // in any deployment environment without needing NEXT_PUBLIC_SITE_URL
  // threaded through every call site.
  path: string;
}

/**
 * A "share this train/station" button, the kind M-Indicator and
 * IndianRailInfo both have on every detail page. Uses the native Web Share
 * API where the browser supports it (mobile Safari/Chrome - opens the
 * OS share sheet), and falls back to copying the link to the clipboard
 * with a brief "Copied" confirmation everywhere else (most desktop
 * browsers don't implement navigator.share).
 */
export default function ShareButton({ title, text, path }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // AbortError when the user just dismisses the native share sheet -
        // not an actual failure, nothing to show the user.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be blocked (permissions, insecure context) -
      // silently do nothing rather than show a broken "Copied" state that
      // wasn't true.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share"
      aria-label={copied ? 'Link copied' : 'Share'}
      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      {copied ? (
        <Check size={18} className="text-green-600 dark:text-green-400" aria-hidden="true" />
      ) : (
        <Share2 size={18} aria-hidden="true" />
      )}
    </button>
  );
}
