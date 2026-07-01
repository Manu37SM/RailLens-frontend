export type Favorite =
  | {
      type: 'train';
      trainNumber: string;
      trainName: string;
    }
  | {
      type: 'station';
      stationCode: string;
      stationName: string;
    };
