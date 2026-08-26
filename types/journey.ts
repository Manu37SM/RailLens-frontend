export interface JourneyTrainResponse {
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: number;
  movingMinutes: number;
  haltedMinutes: number;
  numHalts: number;
  longestHaltMinutes: number | null;
  averageMovingSpeedKmh: number | null;
  nightTravelPercent: number | null;
  dayTravelPercent: number | null;
}
export interface JourneySearchResponse {
  from: string;
  to: string;
  totalTrains: number;
  trains: JourneyTrainResponse[];
}
