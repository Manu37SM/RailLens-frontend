import { StationSearchResponse } from '@/types/station';

interface JourneyStationPickerProps {
  from?: StationSearchResponse;
  onComplete: (from: StationSearchResponse, to: StationSearchResponse) => void;
}
