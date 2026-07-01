import { apiFetch } from "./api";
import {
  StationResponse,
  StationSearchResponse,
} from "@/types/station";

export async function getStation(
  stationCode: string
): Promise<StationResponse> {
  return apiFetch<StationResponse>(
    `/stations/${stationCode}`
  );
}

export async function searchStations(
  query: string
): Promise<StationSearchResponse[]> {
  return apiFetch<StationSearchResponse[]>(
    `/stations/search?q=${encodeURIComponent(query)}`
  );
}