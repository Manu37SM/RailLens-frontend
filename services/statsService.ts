import { datasetFetch } from './api';
import { StatsResponse } from '@/types/stats';
import { RankingsResponse } from '@/types/rankings';
import { FunStatsResponse } from '@/types/funStats';
import { AchievementsResponse } from '@/types/achievements';
export function getStats(): Promise<StatsResponse> {
  return datasetFetch<StatsResponse>('/stats');
}
export function getRankings(): Promise<RankingsResponse> {
  return datasetFetch<RankingsResponse>('/stats/rankings');
}
export function getFunStats(): Promise<FunStatsResponse> {
  return datasetFetch<FunStatsResponse>('/stats/fun-facts');
}
export function getAchievements(): Promise<AchievementsResponse> {
  return datasetFetch<AchievementsResponse>('/stats/achievements');
}
