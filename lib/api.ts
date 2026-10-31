import "server-only";
import { z, ZodError } from "zod";
import { HttpError, type FieldErrors } from "@/lib/errors";

export function jsonError(status: number, error: string, fieldErrors?: FieldErrors) {
  return Response.json(fieldErrors ? { error, fieldErrors } : { error }, { status });
}

/**
 * Every Route Handler funnels its errors through here so the API answers
 * consistently:
 *   ZodError  -> 400 with per-field messages
 *   HttpError -> its own status (401, 403, 404, 409...)
 *   anything else -> 500, details only in the server log
 */
export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const { formErrors, fieldErrors } = z.flattenError(error);
    return jsonError(400, formErrors[0] ?? "Invalid input", fieldErrors);
  }

  if (error instanceof HttpError) {
    return jsonError(error.status, error.message, error.fieldErrors);
  }

  console.error(error);
  return jsonError(500, "Something went wrong on our side. Please try again.");
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}
