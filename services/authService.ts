import {
  apiDeleteAuthed,
  apiGetAuthed,
  apiPost,
  apiPutAuthed,
  sameOriginPost,
} from './api';
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
// Calls that issue or end a session go through this website's server (app/api/auth/*): it keeps the refresh token
// in an HttpOnly cookie and returns refreshToken: null. Everything else talks to the backend directly.
export function register(request: RegisterRequest): Promise<AuthResponse> {
  return sameOriginPost<AuthResponse>('/api/auth/register', request);
}
export function login(request: LoginRequest): Promise<AuthResponse> {
  return sameOriginPost<AuthResponse>('/api/auth/login', request);
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
  return sameOriginPost<AuthResponse>('/api/auth/mfa/confirm', {
    enrolmentToken,
    otp,
  });
}
export function getCurrentUser(token: string): Promise<CurrentUserResponse> {
  return apiGetAuthed<CurrentUserResponse>('/auth/me', token);
}
/** The cookie carries the token; refreshToken is only sent once, to move a pre-2B session into the cookie. */
export function refreshSession(
  request: Partial<RefreshRequest> = {}
): Promise<AuthResponse> {
  return sameOriginPost<AuthResponse>('/api/auth/refresh', request);
}
export function logout(): Promise<void> {
  return sameOriginPost<void>('/api/auth/logout', {});
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
