export interface RouteDistanceProjection {
  trainNumber: string;
  trainName: string;
  distanceKm: number;
}
export interface StationTrafficProjection {
  stationCode: string;
  stationName: string;
  trainCount: number;
}
export interface TrainSpeedProjection {
  trainNumber: string;
  trainName: string;
  averageSpeedKmh: number;
  distanceKm: number;
  durationMinutes: number;
}
export interface StatsResponse {
  totalTrains: number;
  totalStations: number;
  longestRoute: RouteDistanceProjection | null;
  shortestRoute: RouteDistanceProjection | null;
  busiestStation: StationTrafficProjection | null;
  busiestStations: StationTrafficProjection[];
  fastestTrains: TrainSpeedProjection[];
  slowestTrains: TrainSpeedProjection[];
}
