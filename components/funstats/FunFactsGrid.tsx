import Link from 'next/link';
import { Repeat, Ruler, Sparkles, TextQuote, TrainFront } from 'lucide-react';

import Card from '@/components/layout/Card';
import { FunStatsResponse } from '@/types/funStats';

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function FunFactsGrid({ funStats }: { funStats: FunStatsResponse }) {
  const coveredLetters = ALPHABET.filter((letter) => (funStats.stationCountByFirstLetter[letter] ?? 0) > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {funStats.longestStationName && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Ruler className="h-4 w-4 text-orange-600" aria-hidden="true" />
              Longest station name
            </div>
            <Link
              href={`/stations/${funStats.longestStationName.stationCode}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {funStats.longestStationName.stationName}
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {funStats.longestStationName.length} characters
            </p>
          </Card>
        )}

        {funStats.shortestStationName && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Ruler className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Shortest station name
            </div>
            <Link
              href={`/stations/${funStats.shortestStationName.stationCode}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {funStats.shortestStationName.stationName}
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {funStats.shortestStationName.length} characters
            </p>
          </Card>
        )}

        {funStats.mostCommonStationNameWord && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <TextQuote className="h-4 w-4 text-purple-600" aria-hidden="true" />
              Most common word in station names
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
              {funStats.mostCommonStationNameWord.word}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Appears in {funStats.mostCommonStationNameWord.count.toLocaleString()} station names
            </p>
          </Card>
        )}

        {funStats.trainWithMostUniqueStations && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <TrainFront className="h-4 w-4 text-green-600" aria-hidden="true" />
              Most unique stations on one route
            </div>
            <Link
              href={`/trains/${funStats.trainWithMostUniqueStations.trainNumber}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-orange-600"
            >
              {funStats.trainWithMostUniqueStations.trainNumber} · {funStats.trainWithMostUniqueStations.trainName}
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {funStats.trainWithMostUniqueStations.uniqueStationCount.toLocaleString()} distinct stations
            </p>
          </Card>
        )}
      </div>

      <Card>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Sparkles className="h-4 w-4 text-orange-600" aria-hidden="true" />
          Alphabet coverage ({coveredLetters.length}/26 letters)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALPHABET.map((letter) => {
            const count = funStats.stationCountByFirstLetter[letter] ?? 0;
            return (
              <span
                key={letter}
                className={`flex h-7 w-7 items-center justify-center rounded text-xs font-semibold ${
                  count > 0
                    ? 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600'
                }`}
                title={`${count} station${count === 1 ? '' : 's'}`}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </Card>

      {funStats.palindromeStationCodes.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Repeat className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Palindrome station codes
          </div>
          <div className="flex flex-wrap gap-2">
            {funStats.palindromeStationCodes.map((code) => (
              <Link
                key={code}
                href={`/stations/${code}`}
                className="rounded-full bg-blue-100 dark:bg-blue-500/15 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/25"
              >
                {code}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
