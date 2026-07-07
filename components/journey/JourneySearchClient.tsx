'use client';

import { useState, useEffect, useCallback } from 'react';
import { JourneySearchResponse } from '@/types/journey';
import { searchJourneys } from '@/services/journeyService';

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

  const handleSearch = useCallback(async (from: string, to: string) => {
    setLoading(true);

    try {
      const response = await searchJourneys(from, to);
      setResults(response);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      <JourneySearchForm
        onSearch={handleSearch}
        initialFrom={initialFrom}
        initialTo={initialTo}
      />

      <JourneyResults results={results} loading={loading} />
    </div>
  );
}
