export interface JourneyTrainResponse {
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: number;
}

export interface JourneySearchResponse {
  from: string;
  to: string;
  totalTrains: number;
  trains: JourneyTrainResponse[];
}