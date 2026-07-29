export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  // Opaque, long-lived - exchange it at POST /api/auth/refresh for a new
  // access token (and a new refreshToken - it rotates on every use) once
  // this one expires, instead of forcing a re-login. See
  // lib/sessionRefresh.ts.
  refreshToken: string;
  username: string;
  email: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface CurrentUserResponse {
  username: string;
  email: string;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}
