// Pure, runtime-agnostic authorization helpers shared by Edge Functions.
// Deliberately has zero Deno-specific imports (no serve(), no Deno.env, no
// createClient) so this exact file can be unit-tested from the mobile app's
// Jest suite as well as imported by the Deno functions - it never fetches
// anything itself, callers pass in already-fetched data.

export interface AuthenticatedCaller {
  id: string;
}

export interface OwnedRecord {
  user_id: string;
}

export type DriveAccessStatus = 401 | 403 | 404;

export interface DriveAccessResult {
  allowed: boolean;
  status?: DriveAccessStatus;
  reason?: string;
}

// Verifies a caller is authenticated (has a valid JWT-derived identity) and
// owns the given record. Never trusts a user_id supplied by the request
// body - `caller` must come from verifying the request's own JWT.
export function checkOwnership(
  caller: AuthenticatedCaller | null,
  record: OwnedRecord | null
): DriveAccessResult {
  if (!caller) {
    return { allowed: false, status: 401, reason: 'Unauthorized: no valid caller session' };
  }
  if (!record) {
    return { allowed: false, status: 404, reason: 'Record not found' };
  }
  if (record.user_id !== caller.id) {
    return { allowed: false, status: 403, reason: 'Forbidden: caller does not own this record' };
  }
  return { allowed: true };
}
