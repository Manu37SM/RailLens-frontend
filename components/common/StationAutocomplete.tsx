'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import { searchStations } from '@/services/stationService';
import { StationSearchResponse } from '@/types/station';

interface StationAutocompleteProps {
  label: string;
  placeholder?: string;
  onSelect: (station: StationSearchResponse | null) => void;
}

export default function StationAutocomplete({
  label,
  placeholder = 'Search station...',
  onSelect,
}: StationAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<StationSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const results = await searchStations(trimmedQuery);

        if (!controller.signal.aborted) {
          setStations(results);
          setSelectedIndex(-1);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (selectedIndex < 0) return;

    optionRefs.current[selectedIndex]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [selectedIndex]);

  const visibleStations = useMemo(() => {
    if (trimmedQuery.length < 2) {
      return [];
    }

    return stations;
  }, [stations, trimmedQuery]);

  const showDropdown = focused && (loading || visibleStations.length > 0);

  function clearSelection() {
    setQuery('');
    setStations([]);
    setSelectedIndex(-1);
    setFocused(false);

    onSelect(null);
  }

  function selectStation(station: StationSearchResponse) {
    setQuery(`${station.stationName} (${station.stationCode})`);
    setFocused(false);
    onSelect(station);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev >= visibleStations.length - 1 ? 0 : prev + 1
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? visibleStations.length - 1 : prev - 1
        );
        break;

      case 'Enter':
        e.preventDefault();

        if (selectedIndex >= 0) {
          selectStation(visibleStations[selectedIndex]);
        }

        break;

      case 'Escape':
        setFocused(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <Search
        size={16}
        className="absolute top-[42px] left-3 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => {
          setFocused(true);

          if (trimmedQuery.length >= 2) {
            setSelectedIndex(-1);
          }
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          onSelect(null);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pr-10 pl-10 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={clearSelection}
          className="absolute top-[42px] right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      )}

      {showDropdown && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {loading ? (
            <div className="p-3 text-sm text-slate-500">Searching...</div>
          ) : (
            visibleStations.map((station, index) => (
              <button
                key={station.stationCode}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                onClick={() => selectStation(station)}
                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-none ${
                  selectedIndex === index ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="font-medium text-slate-900">
                  {station.stationName}
                </div>

                <div className="text-xs text-slate-500">
                  {station.stationCode}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
