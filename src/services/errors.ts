/**
 * Normalized result type for service calls. Use in UI for loading/error handling.
 */
export type ServiceResult<T, E = Error> =
  | { data: T; error: null }
  | { data: null; error: E };

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function err<E = Error>(error: E): ServiceResult<never, E> {
  return { data: null, error };
}

/** Extract message from Supabase/Postgrest error or generic Error. */
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return "An error occurred";
}
