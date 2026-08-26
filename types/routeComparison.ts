export interface RouteComparisonResponse {
  trainNumberA: string;
  trainNameA: string;
  totalStationsA: number;
  trainNumberB: string;
  trainNameB: string;
  totalStationsB: number;
  sharedStationCount: number;
  routeSimilarityPercent: number;
  longestCommonSegment: string[];
  divergencePoint: string | null;
  convergencePoint: string | null;
  isReverseRoute: boolean;
  isSameRoute: boolean;
}
