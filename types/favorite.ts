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
      // A favorited A -> B station pair from the journey planner -
      // distinct from both a favorited station (a single place) and a
      // Saved Journey (a boarding/de-boarding segment on one specific
      // train). This is "I check this route often," not "I like this
      // train" or "I like this station."
      type: 'route';
      fromStationCode: string;
      fromStationName: string;
      toStationCode: string;
      toStationName: string;
    };
