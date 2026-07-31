'use client';

import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { login } from '@/services/authService';
import { ApiError } from '@/services/api';
import { setSession } from '@/stores/authStore';

export default function LoginForm() {
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usernameOrEmail.trim() || !password) {
      setError('Enter your username/email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await login({ usernameOrEmail: usernameOrEmail.trim(), password });

      setSession({
        token: response.token,
        refreshToken: response.refreshToken,
        username: response.username,
        email: response.email,
      });

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Login failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
      noValidate
    >
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Log in
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Welcome back to RailLens.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="usernameOrEmail"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Username or email
          </label>

          <input
            id="usernameOrEmail"
            type="text"
            autoComplete="username"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-base sm:text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-100 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-base sm:text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-100 focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <LogIn size={16} aria-hidden="true" />
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
          Register
        </Link>
      </p>
    </form>
  );
}
