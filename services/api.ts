const BASE_URL = 'http://localhost:8080/api';

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

export async function apiFetch<T>(endpoint: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`);
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

  return response.json();
}
