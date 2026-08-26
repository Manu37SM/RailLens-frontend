'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { clearSession, useAuthSession } from '@/stores/authStore';
import { logout as logoutRequest } from '@/services/authService';
const linkClasses =
  'hover:text-primary focus-visible:ring-primary rounded-md text-sm font-medium text-slate-600 transition-colors focus-visible:ring-2 focus-visible:outline-none dark:text-slate-300';
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
        className="hover:text-primary hidden items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors sm:flex dark:text-slate-300"
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
