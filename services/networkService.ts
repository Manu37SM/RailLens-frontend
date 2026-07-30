import { apiFetch } from './api';
import { NetworkStatsResponse } from '../types/network';

export function getNetworkStats(): Promise<NetworkStatsResponse> {
  return apiFetch<NetworkStatsResponse>('/network/stats');
}
