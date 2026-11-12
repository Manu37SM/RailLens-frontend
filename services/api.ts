const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  /** Stable reason for errors the UI reacts to, e.g. MFA_REQUIRED. */
  code?: string;
}
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
export async function apiFetch<T>(
  endpoint: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(
      0,
      'Unable to reach the server. Check your connection and try again.'
    );
  }
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code: string | undefined;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body?.error) {
        message = body.error;
      }
      if (typeof body?.code === 'string') {
        code = body.code;
      }
    } catch {}
    throw new ApiError(response.status, message, code);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}
export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  token?: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
export async function apiGetAuthed<T>(
  endpoint: string,
  token: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function apiPutAuthed<T>(
  endpoint: string,
  body: unknown,
  token: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
export async function apiDeleteAuthed<T>(
  endpoint: string,
  body: unknown,
  token: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
export async function apiPostAuthedNoBody<T>(
  endpoint: string,
  token: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}
