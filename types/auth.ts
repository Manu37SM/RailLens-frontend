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
