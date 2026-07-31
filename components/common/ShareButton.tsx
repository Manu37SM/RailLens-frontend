'use client';

import { useState } from 'react';
import { AlertCircle, Check, Share2 } from 'lucide-react';

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
  const [copyFailed, setCopyFailed] = useState(false);

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
      // Clipboard API can be blocked (permissions, insecure context, some
      // http:// LAN preview setups) - previously this failed completely
      // silently, so clicking Share just appeared to do nothing with no
      // way to tell the click even registered. Now at least surfaces that
      // it didn't work, so the user knows to copy the URL manually instead
      // of assuming the button is broken or clicking it repeatedly.
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title={copyFailed ? "Couldn't copy link - copy the URL from your address bar instead" : 'Share'}
      aria-label={copied ? 'Link copied' : copyFailed ? 'Could not copy link' : 'Share'}
      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      {copied ? (
        <Check size={18} className="text-green-600 dark:text-green-400" aria-hidden="true" />
      ) : copyFailed ? (
        <AlertCircle size={18} className="text-red-600 dark:text-red-400" aria-hidden="true" />
      ) : (
        <Share2 size={18} aria-hidden="true" />
      )}
    </button>
  );
}
