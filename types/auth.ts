export interface RegisterRequest {
  /** RailLens login only; with the RailOps login a username is made from the email. */
  username?: string;
  email: string;
  password: string;
  /** RailOps login only (required there). */
  phone?: string;
}
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  /** 6-digit authenticator code; only admin accounts need it. */
  otp?: string;
}
export type UserRole = 'USER' | 'ADMIN';
export interface AuthResponse {
  /** Empty when mfaEnrolmentRequired is true: no session until MFA is set up. */
  token: string | null;
  tokenType: string;
  expiresInSeconds: number;
  refreshToken: string | null;
  username: string;
  email: string;
  /** Absent from servers older than Phase 2A. */
  role?: UserRole;
  mfaEnrolmentRequired?: boolean;
  enrolmentToken?: string;
}
export interface MfaEnrolmentResponse {
  /** base32, for typing into an authenticator app by hand */
  secret: string;
  /** otpauth:// link; opens the authenticator app on phones */
  otpauthUri: string;
}
export interface RefreshRequest {
  refreshToken: string;
}
export interface CurrentUserResponse {
  username: string;
  email: string;
  createdAt: string;
  role?: UserRole;
  mfaEnabled?: boolean;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
export interface DeleteAccountRequest {
  password: string;
}
