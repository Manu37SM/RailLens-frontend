'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search, X } from 'lucide-react';

import { searchStations } from '@/services/stationService';
import { ApiError } from '@/services/api';
import { StationSearchResponse } from '@/types/station';

export interface StationAutocompleteRef {
  focus(): void;
  clear(): void;
  setStation(station: StationSearchResponse | null): void;
}

interface StationAutocompleteProps {
  label: string;
  placeholder?: string;
  onSelect: (station: StationSearchResponse | null) => void;
}

const StationAutocomplete = forwardRef<
  StationAutocompleteRef,
  StationAutocompleteProps
>(function StationAutocomplete(
  { label, placeholder = 'Search station...', onSelect },
  ref
) {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<StationSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selectedStation, setSelectedStation] =
    useState<StationSearchResponse | null>(null);

  // Unique per-instance ids so this component can be mounted multiple times
  // on one page (e.g. journey search's "From"/"To" fields) without ARIA
  // references colliding.
  const instanceId = useId();
  const inputId = `${instanceId}-input`;
  const listboxId = `${instanceId}-listbox`;
  const optionId = (index: number) => `${instanceId}-option-${index}`;

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (selectedStation) {
      return;
    }

    if (trimmedQuery.length < 2) {
      setStations([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await searchStations(trimmedQuery);

        if (!controller.signal.aborted) {
          setStations(results);
          setSelectedIndex(-1);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setStations([]);
          setError(
            err instanceof ApiError
              ? err.message
              : 'Search failed. Please try again.'
          );
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
  }, [trimmedQuery, selectedStation, retryToken]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
        setSelectedIndex(-1);
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

  const showDropdown = focused && trimmedQuery.length >= 2;

  const clearSelection = useCallback(() => {
    setQuery('');
    setSelectedStation(null);
    setStations([]);
    setSelectedIndex(-1);
    setFocused(false);
    setError(null);

    onSelect(null);

    inputRef.current?.focus();
  }, [onSelect]);

  const selectStation = useCallback(
    (station: StationSearchResponse) => {
      setQuery(`${station.stationName} (${station.stationCode})`);
      setSelectedStation(station);

      setStations([]);
      setSelectedIndex(-1);
      setFocused(false);

      onSelect(station);
    },
    [onSelect]
  );

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        inputRef.current?.focus();
      },

      clear: clearSelection,

      setStation(station) {
        if (!station) {
          clearSelection();
          return;
        }

        selectStation(station);
      },
    }),
    [clearSelection, selectStation]
  );

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
        setSelectedIndex(-1);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-[38px] left-3 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />

      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && selectedIndex >= 0
            ? optionId(selectedIndex)
            : undefined
        }
        onFocus={() => {
          setFocused(true);

          if (trimmedQuery.length >= 2) {
            setSelectedIndex(-1);
          }
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedStation(null);
          onSelect(null);
        }}
        onKeyDown={handleKeyDown}
        // text-base (16px) below sm: iOS Safari auto-zooms the viewport on
        // focusing any input smaller than 16px, which is jarring on mobile.
        // Drops back to text-sm at the sm breakpoint to match the desktop
        // design.
        className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 pr-10 pl-10 text-base sm:text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-100 focus:outline-none"
      />

      {query && (
        <button
          type="button"
          onClick={clearSelection}
          aria-label={`Clear ${label}`}
          className="absolute top-[38px] right-3 -translate-y-1/2 rounded p-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400" role="status">
              Searching stations…
            </div>
          ) : error ? (
            <div className="px-4 py-3" role="status">
              <div className="text-sm font-medium text-red-600">{error}</div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setRetryToken((t) => t + 1);
                }}
                className="mt-1 text-xs font-medium text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : visibleStations.length === 0 ? (
            <div className="px-4 py-3" role="status">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No stations found
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Try another station name or code.
              </div>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {visibleStations.map((station, index) => (
                <button
                  key={station.stationCode}
                  id={optionId(index)}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => selectStation(station)}
                  className={`w-full border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 text-left transition last:border-b-0 ${
                    selectedIndex === index
                      ? 'bg-orange-50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {station.stationName}
                  </div>

                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {station.stationCode}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

StationAutocomplete.displayName = 'StationAutocomplete';

export default StationAutocomplete;
