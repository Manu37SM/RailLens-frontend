// NEXT_PUBLIC_ vars are inlined at build time and available in both server
// and client components, which this file is called from (server components
// fetch train/station details directly; client components search/submit
// forms). Without this being configurable, the deployed frontend would
// always try to call a Spring Boot instance on the visitor's own machine -
// this was hardcoded to localhost, which only worked for local dev. Falls
// back to the local dev value so nothing changes for anyone who hasn't set
// it yet.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

/**
 * Shape returned by the backend's GlobalExceptionHandler for every handled
 * failure (see train-db's ApiErrorResponse). Kept in sync with that record.
 */
interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
}

/**
 * Thrown by apiFetch on any non-OK response. Carries the HTTP status so
 * callers can distinguish "not found" from other failures (e.g. to trigger
 * Next's notFound()) without parsing message strings.
 */
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
    response = await fetch(`${BASE_URL}${endpoint}`, init);
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
    } catch {
      // Response wasn't JSON (e.g. an unexpected non-API error) - fall
      // back to the generic message above.
    }

    throw new ApiError(response.status, message);
  }

  // 204 No Content (change-password, delete-account) has no body -
  // calling response.json() on it throws a SyntaxError. Every other
  // successful response is expected to be JSON.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * POSTs a JSON body and parses a JSON response, reusing apiFetch's error
 * handling. Pass `token` to attach it as a Bearer Authorization header (see
 * authService.getCurrentUser, which is the only endpoint that needs one
 * today).
 */
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

/**
 * GETs a JSON response with an Authorization header attached - used for
 * /api/auth/me, the one read endpoint that requires a token.
 */
export async function apiGetAuthed<T>(endpoint: string, token: string): Promise<T> {
  return apiFetch<T>(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * PUTs a JSON body with a Bearer Authorization header attached and
 * discards the response body - used for /api/auth/password, which returns
 * 204 No Content on success.
 */
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

/**
 * DELETEs with a Bearer Authorization header and a JSON body - used for
 * /api/auth/me, which requires the current password in the body even
 * though the request is already token-authenticated (see AuthService on
 * the backend for why). Also returns 204 No Content on success.
 */
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

/**
 * GETs/POSTs with the X-Admin-Key header the backend's AdminApiKeyInterceptor
 * requires for every /api/v1/admin/** route (see the Admin Portal, services/
 * adminService.ts) - a separate, more sensitive shared secret from the
 * per-user JWT the two helpers above use.
 */
export async function apiGetWithAdminKey<T>(endpoint: string, adminKey: string): Promise<T> {
  return apiFetch<T>(endpoint, {
    headers: { 'X-Admin-Key': adminKey },
  });
}

export async function apiPostWithAdminKey<T>(endpoint: string, adminKey: string): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    headers: { 'X-Admin-Key': adminKey },
  });
}
