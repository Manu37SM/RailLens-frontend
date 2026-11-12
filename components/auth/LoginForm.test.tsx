import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';
import { ApiError } from '@/services/api';
import { clearSession, getAccessToken, getSession } from '@/stores/authStore';
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));
const login = vi.fn();
const startMfaEnrolment = vi.fn();
const confirmMfaEnrolment = vi.fn();
vi.mock('@/services/authService', () => ({
  login: (...a: unknown[]) => login(...a),
  startMfaEnrolment: (...a: unknown[]) => startMfaEnrolment(...a),
  confirmMfaEnrolment: (...a: unknown[]) => confirmMfaEnrolment(...a),
}));
const adminSession = {
  token: 'admin-jwt',
  tokenType: 'Bearer',
  expiresInSeconds: 900,
  refreshToken: 'admin-refresh',
  username: 'ops',
  email: 'ops@example.com',
  role: 'ADMIN',
};
function fillCredentials() {
  fireEvent.change(screen.getByLabelText('Username or email'), {
    target: { value: 'ops' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'passw0rd-long' },
  });
}
describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSession();
  });
  it('a normal user logs in with a password as before', async () => {
    login.mockResolvedValue({
      ...adminSession,
      role: 'USER',
      username: 'manish',
    });
    render(<LoginForm />);
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    expect(getSession()?.role).toBe('USER');
  });
  it('asks for the one-time code when the server says MFA_REQUIRED, then sends it', async () => {
    login
      .mockRejectedValueOnce(
        new ApiError(401, 'One-time code required', 'MFA_REQUIRED')
      )
      .mockResolvedValueOnce(adminSession);
    render(<LoginForm />);
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    const code = await screen.findByLabelText('One-time code');
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.change(code, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin'));
    expect(login).toHaveBeenLastCalledWith({
      usernameOrEmail: 'ops',
      password: 'passw0rd-long',
      otp: '123456',
    });
    expect(getSession()?.role).toBe('ADMIN');
  });
  it('a wrong code shows an error and clears the field', async () => {
    login
      .mockRejectedValueOnce(
        new ApiError(401, 'One-time code required', 'MFA_REQUIRED')
      )
      .mockRejectedValueOnce(new ApiError(401, 'Invalid', 'INVALID_OTP'));
    render(<LoginForm />);
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    fireEvent.change(await screen.findByLabelText('One-time code'), {
      target: { value: '000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('didn’t work');
    expect(screen.getByLabelText('One-time code')).toHaveValue('');
    expect(getSession()).toBeNull();
  });
  it('walks a new admin through authenticator setup', async () => {
    login.mockResolvedValue({
      ...adminSession,
      token: null,
      refreshToken: null,
      mfaEnrolmentRequired: true,
      enrolmentToken: 'enrol-jwt',
    });
    startMfaEnrolment.mockResolvedValue({
      secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
      otpauthUri: 'otpauth://totp/RailLens%3Aops?secret=GEZD',
    });
    confirmMfaEnrolment.mockResolvedValue(adminSession);
    render(<LoginForm />);
    fillCredentials();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByTestId('mfa-secret')).toHaveTextContent(
      'GEZD GNBV GY3T QOJQ GEZD GNBV GY3T QOJQ'
    );
    expect(startMfaEnrolment).toHaveBeenCalledWith('enrol-jwt');
    expect(getSession()).toBeNull(); // no session until the first code is confirmed
    fireEvent.change(screen.getByLabelText('Code from your app'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Turn on and log in' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin'));
    expect(confirmMfaEnrolment).toHaveBeenCalledWith('enrol-jwt', '654321');
    expect(getAccessToken()).toBe('admin-jwt');
  });
});
