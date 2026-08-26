import { apiDeleteAuthed, apiGetAuthed, apiPost, apiPutAuthed } from './api';
import {
  AuthResponse,
  ChangePasswordRequest,
  CurrentUserResponse,
  DeleteAccountRequest,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
} from '@/types/auth';
export function register(request: RegisterRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/register', request);
}
export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', request);
}
export function getCurrentUser(token: string): Promise<CurrentUserResponse> {
  return apiGetAuthed<CurrentUserResponse>('/auth/me', token);
}
export function refreshSession(request: RefreshRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/refresh', request);
}
export function logout(request: RefreshRequest): Promise<void> {
  return apiPost<void>('/auth/logout', request);
}
export function changePassword(
  request: ChangePasswordRequest,
  token: string
): Promise<void> {
  return apiPutAuthed<void>('/auth/password', request, token);
}
export function deleteAccount(
  request: DeleteAccountRequest,
  token: string
): Promise<void> {
  return apiDeleteAuthed<void>('/auth/me', request, token);
}
