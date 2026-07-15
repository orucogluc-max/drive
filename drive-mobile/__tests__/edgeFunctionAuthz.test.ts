import { checkOwnership } from '../supabase/functions/_shared/authz';

// Exercises the exact logic both gamification-engine and rule-based-coach
// use to decide whether an authenticated caller may act on a given drive.
// Both Edge Functions run on Deno and can't be executed directly under
// Jest/Node, but this authorization logic has zero Deno-specific imports
// (see authz.ts), so it's tested here directly - this is the real code
// that ships, not a reimplementation of it.
describe('checkOwnership (Edge Function authorization)', () => {
  it('rejects when there is no authenticated caller (missing/invalid JWT)', () => {
    const result = checkOwnership(null, { user_id: 'user-a' });
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(401);
  });

  it('rejects when the record does not exist (bad drive_id)', () => {
    const result = checkOwnership({ id: 'user-a' }, null);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(404);
  });

  it('rejects when the caller is authenticated but does not own the record - User A cannot access User B\'s drive history/insights', () => {
    const result = checkOwnership({ id: 'user-a' }, { user_id: 'user-b' });
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('rejects when both caller and owner are missing/null', () => {
    const result = checkOwnership(null, null);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(401); // missing caller is checked first
  });

  it('allows access when the authenticated caller owns the record', () => {
    const result = checkOwnership({ id: 'user-a' }, { user_id: 'user-a' });
    expect(result.allowed).toBe(true);
    expect(result.status).toBeUndefined();
  });
});
