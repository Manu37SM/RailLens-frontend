import { apiFetch } from './api';
import { TrainDetailsResponse, TrainSearchResponse } from '../types/train';
import { TrainIntelligenceResponse } from '../types/trainIntelligence';
import { RouteComparisonResponse } from '../types/routeComparison';

export async function searchTrains(
  query: string
): Promise<TrainSearchResponse[]> {
  if (!query.trim()) {
    return [];
  }

  return apiFetch<TrainSearchResponse[]>(
    `/trains/search?q=${encodeURIComponent(query)}`
  );
}

export async function getTrainDetails(
  trainNumber: string
): Promise<TrainDetailsResponse> {
  return apiFetch<TrainDetailsResponse>(`/trains/${trainNumber}`);
}

// Deliberately a separate call from getTrainDetails, fetched lazily from
// TrainIntelligenceCard (client-side, on mount) rather than server-side
// alongside the main train details fetch - this endpoint additionally
// builds/reads the network-wide graph snapshot (see
// RailwayNetworkService), so it's meaningfully heavier than the schedule
// lookup the rest of the page needs; the core page shouldn't wait on it.
export async function getTrainIntelligence(
  trainNumber: string
): Promise<TrainIntelligenceResponse> {
  return apiFetch<TrainIntelligenceResponse>(`/trains/${trainNumber}/intelligence`);
}

// "Route Analytics" (FEATURE.md) - fetched on demand only, when a user
// picks a second train to compare against, not alongside the main train
// details fetch.
export async function compareRoutes(
  trainNumber: string,
  otherTrainNumber: string
): Promise<RouteComparisonResponse> {
  return apiFetch<RouteComparisonResponse>(
    `/trains/${trainNumber}/compare/${encodeURIComponent(otherTrainNumber)}`
  );
}
