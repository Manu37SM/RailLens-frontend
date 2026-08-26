'use client';
import { useEffect, useMemo, useState } from 'react';
import { RouteStopResponse, TrainDetailsResponse } from '@/types/train';
import { recordTrainView } from '@/stores/popularityStore';
import TrainHeader from './TrainHeader';
import JourneyTable from './JourneyStop';
import TrainIntelligenceCard from './TrainIntelligenceCard';
import RouteComparisonCard from './RouteComparisonCard';
interface Props {
  train: TrainDetailsResponse;
}
export default function TrainDetailsClient({ train }: Props) {
  const [search, setSearch] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [boardStop, setBoardStop] = useState<RouteStopResponse | null>(null);
  const [deboardStop, setDeboardStop] = useState<RouteStopResponse | null>(
    null
  );
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
  useEffect(() => {
    recordTrainView(train.trainNumber, train.trainName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function handleToggleSelectMode() {
    setSelectMode((prev) => !prev);
    setBoardStop(null);
    setDeboardStop(null);
  }
  function handleSelectStop(stop: RouteStopResponse) {
    if (!boardStop) {
      setBoardStop(stop);
      return;
    }
    if (!deboardStop) {
      if (stop.sequenceNo === boardStop.sequenceNo) {
        setBoardStop(null);
        return;
      }
      setDeboardStop(stop);
      return;
    }
    setBoardStop(stop);
    setDeboardStop(null);
  }
  function handleClearSelection() {
    setSelectMode(false);
    setBoardStop(null);
    setDeboardStop(null);
  }
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

      <TrainIntelligenceCard trainNumber={train.trainNumber} />

      <RouteComparisonCard trainNumber={train.trainNumber} />

      <JourneyTable
        trainNumber={train.trainNumber}
        trainName={train.trainName}
        route={filteredRoute}
        search={search}
        onSearch={setSearch}
        selectMode={selectMode}
        onToggleSelectMode={handleToggleSelectMode}
        boardStop={boardStop}
        deboardStop={deboardStop}
        onSelectStop={handleSelectStop}
        onClearSelection={handleClearSelection}
      />
    </>
  );
}
