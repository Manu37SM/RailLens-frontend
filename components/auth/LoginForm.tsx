'use client';
import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck } from 'lucide-react';
import {
  confirmMfaEnrolment,
  login,
  startMfaEnrolment,
} from '@/services/authService';
import { ApiError } from '@/services/api';
import { signIn } from '@/stores/authStore';
import { inputClasses, labelClasses } from '@/lib/formStyles';
import { AuthResponse, MfaEnrolmentResponse } from '@/types/auth';
import { loginProvider } from '@/lib/loginProvider';
/**
 * password: everyone. otp: admin accounts with MFA (the server answered MFA_REQUIRED).
 * enrol: an admin's first sign-in - set up an authenticator app, then confirm with its first code.
 */
type Step = 'password' | 'otp' | 'enrol';
const OTP_PATTERN = /^\d{6}$/;
/** "ABCD EFGH ..." is much easier to type into a phone than one long run. */
function groupSecret(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim();
}
export default function LoginForm() {
  const router = useRouter();
  /** RailOps login (Phase 4D): email only; staff admins send their code with the password, there is no second step. */
  const railOps = loginProvider() === 'railops';
  const [staffCode, setStaffCode] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<Step>('password');
  const [enrolment, setEnrolment] = useState<
    (MfaEnrolmentResponse & { enrolmentToken: string }) | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function finish(response: AuthResponse) {
    signIn(response);
    router.push(response.role === 'ADMIN' ? '/admin' : '/');
    router.refresh();
  }
  function restart(message: string) {
    setStep('password');
    setEnrolment(null);
    setOtp('');
    setError(message || null);
  }
  async function submitCredentials() {
    if (!usernameOrEmail.trim() || !password) {
      setError(
        railOps
          ? 'Enter your email and password.'
          : 'Enter your username/email and password.'
      );
      return;
    }
    const sendOtp = step === 'otp' || (railOps && staffCode);
    if (sendOtp && !OTP_PATTERN.test(otp)) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    const response = await login({
      usernameOrEmail: usernameOrEmail.trim(),
      password,
      ...(sendOtp ? { otp } : {}),
    });
    if (response.mfaEnrolmentRequired && response.enrolmentToken) {
      const started = await startMfaEnrolment(response.enrolmentToken);
      setEnrolment({ ...started, enrolmentToken: response.enrolmentToken });
      setOtp('');
      setStep('enrol');
      return;
    }
    finish(response);
  }
  async function submitEnrolment() {
    if (!enrolment) return;
    if (!OTP_PATTERN.test(otp)) {
      setError('Enter the 6-digit code your authenticator app shows.');
      return;
    }
    finish(await confirmMfaEnrolment(enrolment.enrolmentToken, otp));
  }
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (step === 'enrol') {
        await submitEnrolment();
      } else {
        await submitCredentials();
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'MFA_REQUIRED') {
        setStep('otp');
        setOtp('');
      } else if (err instanceof ApiError && err.code === 'INVALID_OTP') {
        setOtp('');
        setError(
          'That code didn’t work. Wait for the next code in your app and try again.'
        );
      } else if (
        err instanceof ApiError &&
        err.code === 'INVALID_ENROLMENT_TOKEN'
      ) {
        restart('Setup took too long. Log in again to continue.');
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Login failed. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }
  const otpField = (
    <div>
      <label htmlFor="otp" className={labelClasses}>
        {step === 'enrol' ? 'Code from your app' : 'One-time code'}
      </label>

      <input
        id="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        autoFocus
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        className={`${inputClasses} tracking-[0.3em]`}
      />
    </div>
  );
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      noValidate
    >
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {step === 'enrol' ? 'Set up two-step sign-in' : 'Log in'}
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {step === 'password' && 'Welcome back to RailLens.'}
        {step === 'otp' &&
          'Enter the 6-digit code from your authenticator app.'}
        {step === 'enrol' &&
          'Admin accounts need a code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 1Password…).'}
      </p>

      <div className="mt-6 space-y-4">
        {step !== 'enrol' && (
          <>
            <div>
              <label htmlFor="usernameOrEmail" className={labelClasses}>
                {railOps ? 'Email' : 'Username or email'}
              </label>

              <input
                id="usernameOrEmail"
                type={railOps ? 'email' : 'text'}
                autoComplete={railOps ? 'email' : 'username'}
                value={usernameOrEmail}
                readOnly={step === 'otp'}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
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
                autoComplete="current-password"
                value={password}
                readOnly={step === 'otp'}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
              />
            </div>
          </>
        )}

        {step === 'otp' && otpField}

        {railOps && step === 'password' && staffCode && otpField}

        {railOps && step === 'password' && (
          <button
            type="button"
            onClick={() => {
              setStaffCode((on) => !on);
              setOtp('');
            }}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            {staffCode
              ? 'I don’t use a one-time code'
              : 'Staff? Add your one-time code'}
          </button>
        )}

        {step === 'enrol' && enrolment && (
          <>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>
                In your authenticator app, add an account and choose
                &ldquo;enter a setup key&rdquo;.
              </li>
              <li>
                Account: <strong>RailLens</strong>. Key:
                <code
                  data-testid="mfa-secret"
                  className="mt-1 block rounded-md bg-slate-100 px-2 py-1.5 font-mono text-sm break-all text-slate-900 select-all dark:bg-slate-800 dark:text-slate-100"
                >
                  {groupSecret(enrolment.secret)}
                </code>
                <a
                  href={enrolment.otpauthUri}
                  className="mt-1 inline-block font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  On this phone? Open in authenticator app
                </a>
              </li>
              <li>Type the 6-digit code it shows below.</li>
            </ol>

            {otpField}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep this key private: anyone with it can generate your codes.
            </p>
          </>
        )}

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
          {step === 'password' ? (
            <LogIn size={16} aria-hidden="true" />
          ) : (
            <ShieldCheck size={16} aria-hidden="true" />
          )}
          {submitting
            ? step === 'password'
              ? 'Logging in...'
              : 'Checking...'
            : step === 'enrol'
              ? 'Turn on and log in'
              : step === 'otp'
                ? 'Verify'
                : 'Log in'}
        </button>

        {step !== 'password' && (
          <button
            type="button"
            onClick={() => restart('')}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            Start over
          </button>
        )}
      </div>

      {step === 'password' && (
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            Register
          </Link>
        </p>
      )}
    </form>
  );
}
