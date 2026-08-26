export interface HaltCountEntry {
  trainNumber: string;
  trainName: string;
  haltCount: number;
}
export interface HaltDurationEntry {
  trainNumber: string;
  trainName: string;
  stationCode: string;
  stationName: string;
  minutes: number;
}
export interface StationCountEntry {
  stationCode: string;
  stationName: string;
  count: number;
}
export interface RankingsResponse {
  mostHaltsTrains: HaltCountEntry[];
  fewestHaltsTrains: HaltCountEntry[];
  longestHalts: HaltDurationEntry[];
  shortestHalts: HaltDurationEntry[];
  mostPopularOriginStations: StationCountEntry[];
  mostConnectedStations: StationCountEntry[];
}
