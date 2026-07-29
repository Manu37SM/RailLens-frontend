'use client';

import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';

import Card from '@/components/layout/Card';
import { setAdminKey } from '@/stores/adminKeyStore';

interface AdminKeyFormProps {
  error?: string | null;
}

export default function AdminKeyForm({ error }: AdminKeyFormProps) {
  const [key, setKey] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!key.trim()) return;

    setAdminKey(key.trim());
  }

  return (
    <Card className="mx-auto max-w-sm">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-orange-600" aria-hidden="true" />
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Admin access
        </h1>
      </div>

      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Enter the admin API key to view stats and run data imports. Kept
        only for this browser tab - you&apos;ll need to enter it again next
        session.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="admin-key" className="sr-only">
          Admin API key
        </label>

        <input
          id="admin-key"
          type="password"
          autoComplete="off"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin API key"
          className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-base sm:text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-100 focus:outline-none"
        />

        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700"
        >
          Continue
        </button>
      </form>
    </Card>
  );
}
