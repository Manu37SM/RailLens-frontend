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

// Exchanges a refresh token for a new access token + a rotated refresh
// token (the old one stops working the moment this succeeds - see
// RefreshTokenService on the backend). No Authorization header needed;
// the refresh token itself is the credential.
export function refreshSession(request: RefreshRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/refresh', request);
}

// Revokes a refresh token so it can no longer be exchanged - call on
// logout. Best-effort from the caller's perspective: if this fails (e.g.
// offline), clearing the local session still logs the user out of this
// device, it just leaves that one refresh token valid server-side until
// it naturally expires.
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
