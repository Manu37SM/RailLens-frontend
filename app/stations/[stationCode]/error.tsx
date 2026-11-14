'use client';
import { useEffect } from 'react';
import Container from '@/components/layout/Container';
import ErrorState from '@/components/common/ErrorState';
import { suspectBackendTrouble } from '@/lib/backendStatus/store';
export default function StationDetailsError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // Most server-side failures here are RailLens being asleep or down: check, and say so if it is.
    suspectBackendTrouble('raillens');
  }, [error]);
  return (
    <div className="bg-slate-50 py-5 dark:bg-slate-800">
      <Container>
        <ErrorState
          title="Unable to load station details"
          message="Something went wrong while loading this station. Please try again."
          onRetry={reset}
          homeHref="/stations"
          homeLabel="Back to Station Search"
        />
      </Container>
    </div>
  );
}
