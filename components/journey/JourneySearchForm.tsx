'use client';

import { useState } from 'react';
import StationAutocomplete from '../search/StationAutocomplete';

interface JourneySearchFormProps {
  onSearch: (from: string, to: string) => void;
}

export default function JourneySearchForm({
  onSearch,
}: JourneySearchFormProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <StationAutocomplete
        label="From"
        placeholder="Search source station..."
        onSelect={(station) => {
          setFrom(station.stationCode);
          setError('');
        }}
      />

      <StationAutocomplete
        label="To"
        placeholder="Search destination station..."
        onSelect={(station) => {
          setTo(station.stationCode);
          setError('');
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={!from || !to}
        onClick={() => {
          if (from === to) {
            setError('Source and destination stations must be different.');
            return;
          }

          setError('');
          onSearch(from, to);
        }}
        className={`rounded px-4 py-2 text-white transition-colors ${
          !from || !to
            ? 'cursor-not-allowed bg-slate-300'
            : 'bg-blue-600 hover:bg-blue-700'
        } `}
      >
        Search
      </button>
    </div>
  );
}
