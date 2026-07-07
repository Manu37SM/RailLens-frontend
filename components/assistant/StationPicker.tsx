import { StationSearchResponse } from "@/types/station";

interface StationPickerProps {
  label: string;
  placeholder?: string;
  onSelect: (station: StationSearchResponse) => void;
}