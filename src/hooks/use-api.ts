/**
 * Base API fetch wrapper for React Query hooks.
 * Handles response parsing and error throwing.
 */

interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string };
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith("/") ? path : `/${path}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const err = json as ApiErrorResponse;
    throw new ApiError(
      err.error?.code ?? "UNKNOWN",
      err.error?.message ?? "An error occurred",
      res.status
    );
  }

  return json.data as T;
}
