import { datasetFetch } from './api';
import { NetworkStatsResponse } from '../types/network';
export function getNetworkStats(): Promise<NetworkStatsResponse> {
  return datasetFetch<NetworkStatsResponse>('/network/stats');
}
