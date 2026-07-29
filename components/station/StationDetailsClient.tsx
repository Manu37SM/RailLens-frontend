'use client';
import { useEffect } from 'react';

import Breadcrumb from '@/components/layout/Breadcrumb';

import { StationResponse } from '@/types/station';
import { recordStationView } from '@/stores/popularityStore';

import StationHeader from './StationHeader';
import StationTrainList from './StationTrainList';

interface Props {
  station: StationResponse;
}

export default function StationDetailsClient({ station }: Props) {
  useEffect(() => {
    recordStationView(station.stationCode, station.stationName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed client-side from data GET /stations/{code} already returns
  // (each train's origin/destination flags) - no separate "station
  // statistics" endpoint needed for this.
  const originatingCount = station.trains.filter((t) => t.origin).length;
  const terminatingCount = station.trains.filter((t) => t.destination).length;
  const passingCount = station.trains.filter((t) => !t.origin && !t.destination).length;

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Station Search', href: '/stations' },
          { label: station.stationCode },
        ]}
      />

      <StationHeader
        stationCode={station.stationCode}
        stationName={station.stationName}
        totalTrains={station.totalTrains}
        originatingCount={originatingCount}
        terminatingCount={terminatingCount}
        passingCount={passingCount}
      />

      <StationTrainList trains={station.trains} />
    </>
  );
}
