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
    }
  | {
      type: 'route';
      fromStationCode: string;
      fromStationName: string;
      toStationCode: string;
      toStationName: string;
    };
