export interface TrainIntelligenceResponse {
  trainNumber: string;
  trainName: string;

  routeComplexityScore: number;
  trainUniquenessScore: number;
  expressnessScoreKmPerHalt: number;

  nightTravelPercent: number;
  dayTravelPercent: number;

  longestNonStopSegmentKm: number | null;
  longestNonStopSegmentFromStation: string | null;
  longestNonStopSegmentToStation: string | null;

  averageHaltMinutes: number;
  journeyEfficiencyIndex: number;

  isCircularRoute: boolean;

  possiblySkippedStations: string[];
}
