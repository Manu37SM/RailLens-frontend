export interface StationIntelligenceResponse {
  stationCode: string;
  stationName: string;
  networkRank: number | null;
  totalStationsInNetwork: number;
  connectivityScore: number;
  betweennessCentrality: number;
  closenessCentrality: number;
  degree: number;
  totalStops: number;
  originCount: number;
  destinationCount: number;
  transitCount: number;
  originPercent: number;
  destinationPercent: number;
  transitPercent: number;
  averageHaltMinutes: number;
  averageTrainSpeedKmh: number | null;
  stationImportanceScore: number;
  departureCountByHour: number[];
  arrivalCountByHour: number[];
}
