'use client';
import { useEffect } from 'react';
import Container from '@/components/layout/Container';
import ErrorState from '@/components/common/ErrorState';
export default function TrainDetailsError({
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
    <div className="bg-background py-5">
      <Container>
        <ErrorState
          title="Unable to load train details"
          message="Something went wrong while loading this train. Please try again."
          onRetry={reset}
          homeHref="/trains"
          homeLabel="Back to Train Search"
        />
      </Container>
    </div>
  );
}
