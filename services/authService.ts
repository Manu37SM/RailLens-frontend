import { apiDeleteAuthed, apiGetAuthed, apiPost, apiPutAuthed } from './api';
import {
  AuthResponse,
  ChangePasswordRequest,
  CurrentUserResponse,
  DeleteAccountRequest,
  LoginRequest,
  MfaEnrolmentResponse,
  RefreshRequest,
  RegisterRequest,
} from '@/types/auth';
export function register(request: RegisterRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/register', request);
}
export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', request);
}
/** Admin MFA setup step 1: secret for the authenticator app. */
export function startMfaEnrolment(
  enrolmentToken: string
): Promise<MfaEnrolmentResponse> {
  return apiPost<MfaEnrolmentResponse>('/auth/mfa/enrol', { enrolmentToken });
}
/** Step 2: first code from the app; returns an admin session. */
export function confirmMfaEnrolment(
  enrolmentToken: string,
  otp: string
): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/mfa/confirm', { enrolmentToken, otp });
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
