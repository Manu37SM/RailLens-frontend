import { apiGetWithAdminKey, apiPostWithAdminKey } from './api';
import {
  AdminStatsResponse,
  DatasetHealthResponse,
  ImportResult,
} from '@/types/admin';
export function getAdminStats(adminKey: string): Promise<AdminStatsResponse> {
  return apiGetWithAdminKey<AdminStatsResponse>('/admin/stats', adminKey);
}
export function getDatasetHealth(
  adminKey: string
): Promise<DatasetHealthResponse> {
  return apiGetWithAdminKey<DatasetHealthResponse>('/admin/health', adminKey);
}
export function triggerImport(adminKey: string): Promise<ImportResult> {
  return apiPostWithAdminKey<ImportResult>('/admin/import', adminKey);
}
export function clearCache(adminKey: string): Promise<void> {
  return apiPostWithAdminKey<void>('/admin/cache/clear', adminKey);
}
