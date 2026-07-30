import { RouteDistanceProjection, TrainSpeedProjection } from './stats';

export interface SuperExpressEntry {
  trainNumber: string;
  trainName: string;
  kmPerHalt: number;
}

export interface RareRouteEntry {
  trainNumber: string;
  trainName: string;
  averageTrainsPerHop: number;
}

export interface HiddenGemEntry {
  trainNumber: string;
  trainName: string;
  distanceKm: number;
  averageSpeedKmh: number;
}

export interface AchievementsResponse {
  longestRoutes: RouteDistanceProjection[];
  fastestTrains: TrainSpeedProjection[];
  megaRoutes: RouteDistanceProjection[];
  superExpressRankings: SuperExpressEntry[];
  rareRoutes: RareRouteEntry[];
  hiddenGems: HiddenGemEntry[];
}
