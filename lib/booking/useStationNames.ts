'use client';
import { useEffect, useState } from 'react';
import { getTrainDetails } from '@/services/trainService';

/** Station code → name from RailLens' own route data. RailOps only knows codes. Falls back to codes on any error. */
export function useStationNames(
  trainNo: string | null | undefined
): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!trainNo) return;
    let alive = true;
    getTrainDetails(trainNo)
      .then((t) => {
        if (alive)
          setNames(
            Object.fromEntries(
              t.route.map((s) => [s.stationCode, s.stationName])
            )
          );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [trainNo]);
  return names;
}

export function stationLabel(
  code: string,
  names: Record<string, string>
): string {
  return names[code] ? `${names[code]} (${code})` : code;
}
