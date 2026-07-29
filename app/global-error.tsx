'use client';

import { useEffect } from 'react';

// app/error.tsx (the regular route-segment error boundary) does NOT catch
// errors thrown by the root layout itself (Navbar, the theme script, font
// loading, etc.) - Next.js requires this separate global-error.tsx for
// that case, and it has to render its own <html>/<body> since it replaces
// the entire root layout when it triggers. Kept deliberately minimal - no
// Tailwind theme variables, no Navbar, nothing that could itself be part
// of what just broke.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
            RailLens hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              background: '#ea580c',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
