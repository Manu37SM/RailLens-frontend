'use client';
import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { register } from '@/services/authService';
import { ApiError } from '@/services/api';
import { setSession } from '@/stores/authStore';
import { inputClasses, labelClasses } from '@/lib/formStyles';
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;
export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function validate(): string | null {
    if (username.trim().length < 3 || username.trim().length > 30) {
      return 'Username must be between 3 and 30 characters.';
    }
    if (!USERNAME_PATTERN.test(username.trim())) {
      return 'Username may only contain letters, numbers and underscores.';
    }
    if (!email.trim()) {
      return 'Email is required.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (!PASSWORD_PATTERN.test(password)) {
      return 'Password must contain at least one letter and one number.';
    }
    return null;
  }
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
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
          : 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      noValidate
    >
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Create an account
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Join RailLens to save favorites and searches.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="username" className={labelClasses}>
            Username
          </label>

          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />

          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            At least 8 characters, with a letter and a number.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm font-medium text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <UserPlus size={16} aria-hidden="true" />
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
