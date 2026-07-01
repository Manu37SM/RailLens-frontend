export interface StationTrainResponse {
  trainNumber: string;
  trainName: string;

  arrivalTime: string | null;
  departureTime: string | null;

  distance: number;
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
