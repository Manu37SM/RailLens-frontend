'use client';
import Breadcrumb from '@/components/layout/Breadcrumb';

import { StationResponse } from '@/types/station';

import StationHeader from './StationHeader';
import StationTrainList from './StationTrainList';

interface Props {
  station: StationResponse;
}

export default function StationDetailsClient({ station }: Props) {
  return (
    <>
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: station.stationCode }]}
      />

      <StationHeader
        stationCode={station.stationCode}
        stationName={station.stationName}
        totalTrains={station.totalTrains}
      />

      <StationTrainList trains={station.trains} />
    </>
  );
}
