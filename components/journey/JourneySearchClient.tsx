'use client';

import { useState, useCallback, useRef } from 'react';
import { JourneySearchResponse } from '@/types/journey';
import { searchJourneys } from '@/services/journeyService';
import { ApiError } from '@/services/api';

import JourneySearchForm from './JourneySearchForm';
import JourneyResults from './JourneyResults';

interface JourneySearchClientProps {
  initialFrom?: string;
  initialTo?: string;
}

export default function JourneySearchClient({
  initialFrom,
  initialTo,
}: JourneySearchClientProps) {
  const [results, setResults] = useState<JourneySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSearchRef = useRef<{ from: string; to: string } | null>(null);

  const handleSearch = useCallback(async (from: string, to: string) => {
    lastSearchRef.current = { from, to };
    setLoading(true);
    setError(null);

    try {
      const response = await searchJourneys(from, to);
      setResults(response);
    } catch (err) {
      setResults(null);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while searching for journeys. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastSearchRef.current) {
      handleSearch(lastSearchRef.current.from, lastSearchRef.current.to);
    }
  }, [handleSearch]);

  return (
    <div className="space-y-4">
      <JourneySearchForm
        onSearch={handleSearch}
        initialFrom={initialFrom}
        initialTo={initialTo}
      />

      <JourneyResults
        results={results}
        loading={loading}
        error={error}
        onRetry={handleRetry}
      />
    </div>
  );
}
