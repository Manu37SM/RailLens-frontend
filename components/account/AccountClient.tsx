'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, MapPin, Trash2, User } from 'lucide-react';

import { changePassword, deleteAccount, getCurrentUser } from '@/services/authService';
import { ApiError } from '@/services/api';
import { clearSession, useAuthSession } from '@/stores/authStore';
import { getValidAccessToken } from '@/lib/sessionRefresh';
import {
  clearDefaultFromStation,
  setDefaultFromStation,
  usePreferences,
} from '@/stores/preferencesStore';
import StationAutocomplete, {
  StationAutocompleteRef,
} from '@/components/common/StationAutocomplete';
import { CurrentUserResponse } from '@/types/auth';

// Mirrors train-db's ChangePasswordRequest bean validation (see
// train-db/.../model/ChangePasswordRequest.java) - same client-side
// pre-check pattern as RegisterForm/LoginForm, backend still re-validates.
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const inputClasses =
  'h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-base sm:text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-100 focus:outline-none';
const labelClasses = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';
const cardClasses =
  'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm';

export default function AccountClient() {
  const router = useRouter();
  const session = useAuthSession();

  const [profile, setProfile] = useState<CurrentUserResponse | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // session is null for one render on first mount (useSyncExternalStore's
  // server snapshot) before localStorage is read client-side, so we can't
  // redirect on that alone - wait a tick to avoid bouncing a logged-in
  // user straight back to /login.
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    setCheckedSession(true);
  }, []);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    getValidAccessToken()
      .then((token) => {
        if (!token) throw new ApiError(401, 'Session expired. Please log in again.');
        return getCurrentUser(token);
      })
      .then((response) => {
        if (!cancelled) setProfile(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfileError(
          err instanceof ApiError ? err.message : 'Failed to load your account.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (checkedSession && !session) {
      router.replace('/login');
    }
  }, [checkedSession, session, router]);

  if (!session) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div className={cardClasses}>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          <User size={20} aria-hidden="true" />
          Account
        </h1>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Username</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {profile?.username ?? session.username}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {profile?.email ?? session.email}
            </dd>
          </div>
          {profile?.createdAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Member since</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(profile.createdAt).toLocaleDateString()}
              </dd>
            </div>
          )}
        </dl>

        {profileError && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {profileError}
          </p>
        )}
      </div>

      <PreferencesCard />
      <ChangePasswordCard />
      <DeleteAccountCard />
    </div>
  );
}

function PreferencesCard() {
  const preferences = usePreferences();
  const stationRef = useRef<StationAutocompleteRef>(null);

  // Hydrate the autocomplete's displayed value from the already-saved
  // preference on mount - StationAutocomplete manages its own input state
  // internally and has no "value" prop, so without this the field would
  // render empty even when a default is already set (same pattern
  // JourneySearchForm uses to hydrate from initialFrom/initialTo).
  useEffect(() => {
    if (preferences.defaultFromStationCode && preferences.defaultFromStationName) {
      stationRef.current?.setStation({
        stationCode: preferences.defaultFromStationCode,
        stationName: preferences.defaultFromStationName,
      });
    }
    // Only on mount - re-running this on every preferences change would
    // fight the user while they're actively typing a new selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cardClasses}>
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <MapPin size={18} aria-hidden="true" />
        Preferences
      </h2>

      <div className="mt-4">
        <StationAutocomplete
          ref={stationRef}
          label="Default “From” station"
          placeholder="e.g. your home station"
          onSelect={(station) => {
            if (station) {
              setDefaultFromStation(station.stationCode, station.stationName);
            } else {
              clearDefaultFromStation();
            }
          }}
        />

        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {preferences.defaultFromStationName
            ? `Pre-fills "${preferences.defaultFromStationName}" as the From station on the journey planner.`
            : 'Pre-fills a station as the From station on the journey planner, so you don’t have to search for it every time.'}
        </p>
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function validate(): string | null {
    if (!currentPassword) {
      return 'Current password is required.';
    }

    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters.';
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      return 'New password must contain at least one letter and one number.';
    }

    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess(false);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await getValidAccessToken();
      if (!token) throw new ApiError(401, 'Session expired. Please log in again.');

      await changePassword({ currentPassword, newPassword }, token);
      setCurrentPassword('');
      setNewPassword('');
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to change password. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cardClasses} noValidate>
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <KeyRound size={18} aria-hidden="true" />
        Change password
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="currentPassword" className={labelClasses}>
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="newPassword" className={labelClasses}>
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClasses}
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            At least 8 characters, with a letter and a number.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-sm font-medium text-green-600 dark:text-green-400">
            Password changed.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? 'Saving...' : 'Change password'}
        </button>
      </div>
    </form>
  );
}

function DeleteAccountCard() {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!password) {
      setError('Password is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = await getValidAccessToken();
      if (!token) throw new ApiError(401, 'Session expired. Please log in again.');

      await deleteAccount({ password }, token);
      clearSession();
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to delete account. Please try again.'
      );
      setSubmitting(false);
    }
  }

  return (
    <div className={`${cardClasses} border-red-200 dark:border-red-900/50`}>
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <Trash2 size={18} aria-hidden="true" />
        Delete account
      </h2>

      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        This permanently deletes your account. This cannot be undone.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-300 dark:border-red-800 font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="deletePassword" className={labelClasses}>
              Confirm your password
            </label>
            <input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-red-600 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? 'Deleting...' : 'Confirm delete'}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setPassword('');
                setError(null);
              }}
              disabled={submitting}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
