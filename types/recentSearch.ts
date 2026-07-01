export type RecentSearch =
  | {
      type: 'train';
      trainNumber: string;
      trainName: string;
      timestamp: number;
    }
  | {
      type: 'station';
      stationCode: string;
      stationName: string;
      timestamp: number;
    }
  | {
      type: 'journey';
      fromCode: string;
      fromName: string;
      toCode: string;
      toName: string;
      timestamp: number;
    };
