export interface StationNameEntry {
  stationCode: string;
  stationName: string;
  length: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface TrainStopEntry {
  trainNumber: string;
  trainName: string;
  uniqueStationCount: number;
}

export interface FunStatsResponse {
  longestStationName: StationNameEntry | null;
  shortestStationName: StationNameEntry | null;
  mostCommonStationNameWord: WordFrequency | null;
  stationCountByFirstLetter: Record<string, number>;
  trainWithMostUniqueStations: TrainStopEntry | null;
  palindromeStationCodes: string[];
}
