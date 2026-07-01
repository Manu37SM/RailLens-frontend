import { apiFetch } from './api';
import { JourneySearchResponse } from '@/types/journey';

export async function searchJourneys(
  from: string,
  to: string
): Promise<JourneySearchResponse> {
  return apiFetch<JourneySearchResponse>(`/journeys?from=${from}&to=${to}`);
}
