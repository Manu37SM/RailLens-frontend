export interface CentralStation {
  stationCode: string;
  stationName: string;
  betweennessCentrality: number;
  closenessCentrality: number;
  degree: number;
}
export interface NetworkStatsResponse {
  totalStations: number;
  totalTrains: number;
  totalEdges: number;
  routeDensity: number;
  connectedComponentCount: number;
  largestComponentSize: number;
  networkDiameter: number;
  mostCentralStations: CentralStation[];
}
