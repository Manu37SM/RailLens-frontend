import { ApiError, apiGetAuthed, apiPostAuthedNoBody } from './api';
import { getValidAccessToken } from '@/lib/sessionRefresh';
import {
  AdminStatsResponse,
  DatasetHealthResponse,
  ImportResult,
} from '@/types/admin';
/**
 * Admin calls use the signed-in admin's own session (password + one-time code). Admin access tokens are short-lived
 * (15 minutes), so each call goes through getValidAccessToken, which refreshes when needed.
 */
async function adminToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new ApiError(401, 'Admin sign-in required');
  }
  return token;
}
export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiGetAuthed<AdminStatsResponse>('/admin/stats', await adminToken());
}
export async function getDatasetHealth(): Promise<DatasetHealthResponse> {
  return apiGetAuthed<DatasetHealthResponse>('/admin/health', await adminToken());
}
export async function triggerImport(): Promise<ImportResult> {
  return apiPostAuthedNoBody<ImportResult>('/admin/import', await adminToken());
}
export async function clearCache(): Promise<void> {
  return apiPostAuthedNoBody<void>('/admin/cache/clear', await adminToken());
}
