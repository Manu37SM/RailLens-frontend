import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterForm from './RegisterForm';
import { clearSession } from '@/stores/authStore';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));
const register = vi.fn();
vi.mock('@/services/authService', () => ({
  register: (...a: unknown[]) => register(...a),
}));
const session = {
  token: 't',
  tokenType: 'Bearer',
  expiresInSeconds: 600,
  refreshToken: null,
  username: 'asha_1a2b3c',
  email: 'asha@example.com',
  role: 'USER',
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSession();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('RailLens login: username, email and password, as before', async () => {
    register.mockResolvedValue(session);
    render(<RegisterForm />);
    expect(screen.queryByLabelText('Phone number')).toBeNull();
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'asha' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'asha@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'passw0rd' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    expect(register).toHaveBeenCalledWith({
      username: 'asha',
      email: 'asha@example.com',
      password: 'passw0rd',
    });
  });

  it('RailOps login: no username, a phone number, and at least 10 characters', async () => {
    vi.stubEnv('NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER', 'railops');
    register.mockResolvedValue(session);
    render(<RegisterForm />);
    expect(screen.queryByLabelText('Username')).toBeNull();
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'asha@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '98765 43210' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'short-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('at least 10');
    expect(register).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'long-enough-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    expect(register).toHaveBeenCalledWith({
      email: 'asha@example.com',
      phone: '98765 43210',
      password: 'long-enough-1',
    });
  });
});
