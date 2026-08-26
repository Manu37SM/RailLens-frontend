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
export async function getTrainIntelligence(
  trainNumber: string
): Promise<TrainIntelligenceResponse> {
  return apiFetch<TrainIntelligenceResponse>(
    `/trains/${trainNumber}/intelligence`
  );
}
export async function compareRoutes(
  trainNumber: string,
  otherTrainNumber: string
): Promise<RouteComparisonResponse> {
  return apiFetch<RouteComparisonResponse>(
    `/trains/${trainNumber}/compare/${encodeURIComponent(otherTrainNumber)}`
  );
}
