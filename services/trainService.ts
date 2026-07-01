import { apiFetch } from './api';
import { TrainDetailsResponse, TrainSearchResponse } from '../types/train';

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
