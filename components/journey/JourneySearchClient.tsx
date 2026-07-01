"use client";

import { useState } from "react";
import { JourneySearchResponse } from "@/types/journey";
import { searchJourneys } from "@/services/journeyService";

import JourneySearchForm from "./JourneySearchForm";
import JourneyResults from "./JourneyResults";

export default function JourneySearchClient() {
  const [results, setResults] = useState<JourneySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(from: string, to: string) {
    setLoading(true);

    try {
      const response = await searchJourneys(from, to);
      setResults(response);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <JourneySearchForm onSearch={handleSearch} />

      <JourneyResults
        results={results}
        loading={loading}
      />
    </div>
  );
}