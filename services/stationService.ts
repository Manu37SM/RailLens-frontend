import { apiFetch, datasetFetch } from './api';
import { StationResponse, StationSearchResponse } from '@/types/station';
import { StationIntelligenceResponse } from '@/types/stationIntelligence';
export async function getStation(
  stationCode: string
): Promise<StationResponse> {
  // Server pages only (page + its metadata): one cached call instead of two backend round trips per view.
  return datasetFetch<StationResponse>(`/stations/${stationCode}`);
}
export async function getStationIntelligence(
  stationCode: string
): Promise<StationIntelligenceResponse> {
  return apiFetch<StationIntelligenceResponse>(
    `/stations/${stationCode}/intelligence`
  );
}
export async function searchStations(
  query: string
): Promise<StationSearchResponse[]> {
  return apiFetch<StationSearchResponse[]>(
    `/stations/search?q=${encodeURIComponent(query)}`
  );
}
