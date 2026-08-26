const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
}
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body?.error) {
        message = body.error;
      }
    } catch {}
    throw new ApiError(response.status, message);
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
export async function apiGetWithAdminKey<T>(
  endpoint: string,
  adminKey: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    headers: { 'X-Admin-Key': adminKey },
  });
}
export async function apiPostWithAdminKey<T>(
  endpoint: string,
  adminKey: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    headers: { 'X-Admin-Key': adminKey },
  });
}
