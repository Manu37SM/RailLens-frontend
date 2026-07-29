export interface StationTrainResponse {
  trainNumber: string;
  trainName: string;

  arrivalTime: string | null;
  departureTime: string | null;

  // Source data frequently lacks distance for a stop (see the RailLens
  // database review) - genuinely nullable, not just optional.
  distance: number | null;
  sequenceNo: number;

  origin: boolean;
  destination: boolean;
}

export interface StationResponse {
  stationCode: string;
  stationName: string;

  totalTrains: number;

  trains: StationTrainResponse[];
}

export interface StationSearchResponse {
  stationCode: string;
  stationName: string;
}
