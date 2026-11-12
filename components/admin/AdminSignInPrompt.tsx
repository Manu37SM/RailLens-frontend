'use client';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import Card from '@/components/layout/Card';
interface AdminSignInPromptProps {
  /** Signed in, but as a user account (or a session from before admin rights were granted). */
  signedIn: boolean;
}
export default function AdminSignInPrompt({
  signedIn,
}: AdminSignInPromptProps) {
  return (
    <Card className="mx-auto max-w-sm">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-orange-600" aria-hidden="true" />
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Admin access
        </h1>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {signedIn
          ? 'This account doesn’t have an admin session. If you were just made an admin, log out and sign in again with your one-time code.'
          : 'Sign in with an admin account. You’ll need your password and a code from your authenticator app.'}
      </p>

      {!signedIn && (
        <Link
          href="/login"
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700"
        >
          Log in
        </Link>
      )}
    </Card>
  );
}
