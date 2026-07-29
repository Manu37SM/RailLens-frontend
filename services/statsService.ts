import { apiFetch } from './api';
import { StatsResponse } from '@/types/stats';

export function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/stats');
}
