import { apiFetch } from './api';
import { SmartSearchResponse } from '@/types/smartSearch';

export function smartSearch(query: string): Promise<SmartSearchResponse> {
  return apiFetch<SmartSearchResponse>(`/search/smart?q=${encodeURIComponent(query)}`);
}
