'use client';

import { useEffect, useMemo, useState } from 'react';

import { TrainDetailsResponse } from '@/types/train';

import TrainHeader from './TrainHeader';
import JourneyTable from './JourneyStop';

interface Props {
  train: TrainDetailsResponse;
}

export default function TrainDetailsClient({ train }: Props) {
  const [search, setSearch] = useState('');

  const filteredRoute = useMemo(() => {
    if (!search.trim()) {
      return train.route;
    }

    const query = search.toLowerCase();

    return train.route.filter(
      (stop) =>
        stop.stationName.toLowerCase().includes(query) ||
        stop.stationCode.toLowerCase().includes(query)
    );
  }, [search, train.route]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  return (
    <>
      <TrainHeader
        trainNumber={train.trainNumber}
        trainName={train.trainName}
        sourceStationName={train.sourceStationName}
        destinationStationName={train.destinationStationName}
        distance={train.journeyDistance}
        stops={train.totalStops}
        minutes={train.journeyMinutes}
        speed={train.averageSpeed}
      />

      <JourneyTable
        route={filteredRoute}
        search={search}
        onSearch={setSearch}
      />
    </>
  );
}
