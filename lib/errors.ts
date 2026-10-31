export type FieldErrors = Record<string, string[] | undefined>;

/**
 * Thrown by the service layer when a request can't be completed for a known
 * reason (not found, not allowed, conflict...). Route Handlers turn it into a
 * JSON response with the matching status code.
 */
export class HttpError extends Error {
  status: number;
  fieldErrors?: FieldErrors;

  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
