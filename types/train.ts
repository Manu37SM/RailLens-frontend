export interface TrainSearchResponse {
  trainNumber: string;
  trainName: string;
}
export interface RouteStopResponse {
  sequenceNo: number;
  stationCode: string;
  stationName: string;
  arrivalTime: string | null;
  departureTime: string | null;
  distance: number | null;
  distanceFromPrevious: number | null;
  haltMinutes: number;
  journeyDay: number;
  origin: boolean;
  destination: boolean;
}
export interface TrainDetailsResponse {
  trainNumber: string;
  trainName: string;
  totalStops: number;
  journeyDistance: number;
  journeyMinutes: number;
  averageSpeed: number;
  sourceStationName: string;
  destinationStationName: string;
  route: RouteStopResponse[];
}
