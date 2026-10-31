import type { FieldErrors } from "@/lib/errors";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; fieldErrors?: FieldErrors };

/**
 * Small fetch wrapper for Client Components that call our Route Handlers.
 * It always resolves, so components only have to check `ok`.
 */
export async function apiRequest<T = unknown>(
  url: string,
  { method, body }: { method: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown },
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, error: "Network error. Check your connection and try again." };
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error =
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : (data.error ?? "Something went wrong. Please try again.");
    return { ok: false, status: response.status, error, fieldErrors: data.fieldErrors };
  }

  return { ok: true, data: data as T };
}
