'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

import { clearSession, useAuthSession } from '@/stores/authStore';
import { logout as logoutRequest } from '@/services/authService';

const linkClasses =
  'hover:text-primary focus-visible:ring-primary rounded-md text-sm font-medium text-slate-600 transition-colors focus-visible:ring-2 focus-visible:outline-none dark:text-slate-300';

/**
 * Renders as a client component (unlike the rest of Navbar) because it
 * needs useAuthSession's useSyncExternalStore hook to know whether anyone's
 * logged in - the token only exists in localStorage, so this can't be
 * resolved server-side. Kept as its own small component rather than
 * converting the whole Navbar to a client component, matching how
 * ThemeToggle is split out for the same reason.
 */
export default function AuthNavLinks() {
  const router = useRouter();
  const session = useAuthSession();

  if (!session) {
    return (
      <>
        <Link href="/login" className={linkClasses}>
          Log in
        </Link>

        <Link
          href="/register"
          className="focus-visible:ring-primary rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus-visible:ring-2 focus-visible:outline-none"
        >
          Register
        </Link>
      </>
    );
  }

  function handleLogout() {
    // Revoke the refresh token server-side too, not just clear it
    // locally - otherwise it stays valid for up to
    // raillens.jwt.refresh-expiration-days if it's ever exfiltrated.
    // Best-effort: local logout must succeed even if this call fails
    // (e.g. offline) - see logout()'s docstring in authService.ts.
    if (session?.refreshToken) {
      logoutRequest({ refreshToken: session.refreshToken }).catch(() => {});
    }

    clearSession();
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <Link
        href="/account"
        className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex hover:text-primary transition-colors"
      >
        <User size={16} aria-hidden="true" />
        {session.username}
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        className={`${linkClasses} flex items-center gap-1.5`}
      >
        <LogOut size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </>
  );
}
