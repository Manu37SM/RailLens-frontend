import {
  BackendService,
  reportBackendTrouble,
} from '@/lib/backendStatus/store';
import { loginProvider } from '@/lib/loginProvider';

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
  init?: RequestInit,
  timeoutMs = 10000
): Promise<T> {
  return requestJson<T>(`${BASE_URL}${endpoint}`, init, timeoutMs);
}

/** How long the server keeps a successful dataset answer (stats, rankings, network...). The timetable rarely changes. */
export const DATASET_REVALIDATE_SECONDS = 3600;

/**
 * GET for the dataset pages, called from server components only. A successful answer is kept in Next's data cache
 * for an hour and refreshed in the background, so visitors get it instantly even while the free backend sleeps.
 * Failures are never cached. The long timeout lets a sleeping backend wake up (about a minute at worst).
 */
export function datasetFetch<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(
    endpoint,
    { next: { revalidate: DATASET_REVALIDATE_SECONDS } },
    50000
  );
}
/**
 * POST to this website's own sign-in routes (app/api/auth/*), which keep the refresh token in an HttpOnly cookie.
 * Longer timeout: the first request after the free backend has been asleep can take up to a minute.
 */
export async function sameOriginPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  return requestJson<T>(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    },
    65000,
    // These routes sign in through RailOps once the login switch is on; report trouble against the right backend.
    loginProvider() === 'railops' ? 'railops' : 'raillens'
  );
}
async function requestJson<T>(
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number,
  service: BackendService = 'raillens'
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
    });
  } catch {
    reportBackendTrouble(service, 0);
    throw new ApiError(
      0,
      'Unable to reach the server. Check your connection and try again.'
    );
  }
  if (!response.ok) {
    reportBackendTrouble(service, response.status);
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
