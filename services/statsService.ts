import { apiFetch } from './api';
import { StatsResponse } from '@/types/stats';
import { RankingsResponse } from '@/types/rankings';
import { FunStatsResponse } from '@/types/funStats';
import { AchievementsResponse } from '@/types/achievements';
export function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/stats');
}
export function getRankings(): Promise<RankingsResponse> {
  return apiFetch<RankingsResponse>('/stats/rankings');
}
export function getFunStats(): Promise<FunStatsResponse> {
  return apiFetch<FunStatsResponse>('/stats/fun-facts');
}
export function getAchievements(): Promise<AchievementsResponse> {
  return apiFetch<AchievementsResponse>('/stats/achievements');
}
