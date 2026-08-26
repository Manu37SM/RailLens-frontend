'use client';
import { useEffect } from 'react';
import Container from '@/components/layout/Container';
import ErrorState from '@/components/common/ErrorState';
export default function GlobalError({
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
  }, [error]);
  return (
    <div className="bg-background flex min-h-[60vh] items-center py-5">
      <Container>
        <ErrorState
          title="Something went wrong"
          message="An unexpected error occurred. Please try again."
          onRetry={reset}
        />
      </Container>
    </div>
  );
}
