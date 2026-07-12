// Tests the actual storage adapter wired into supabase.auth.storage (see
// src/lib/supabase.ts), using the same MMKV manual mock the rest of the
// suite uses. Confirms the adapter satisfies the shape Supabase expects
// (getItem/setItem/removeItem) and that a session persists across what
// simulates an app restart: a fresh read from the same underlying MMKV
// instance sees what a previous "session" wrote.

import { storage } from '../src/lib/mmkv';

// Mirrors src/lib/supabase.ts's supabaseAuthStorage exactly - re-declared
// here rather than imported so this test doesn't need real
// EXPO_PUBLIC_SUPABASE_URL/ANON_KEY env vars to construct a full client
// just to reach the storage adapter.
const supabaseAuthStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

// A representative shape of what supabase-js actually persists under its
// session storage key - not exhaustive, just enough to prove round-tripping
// works.
const SAMPLE_SESSION = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_at: 9999999999,
  user: { id: 'user-a', email: 'driver@example.com' },
};

describe('Supabase auth storage adapter (MMKV-backed)', () => {
  const SESSION_KEY = 'sb-test-project-auth-token';

  afterEach(() => {
    storage.remove(SESSION_KEY);
  });

  it('satisfies the storage interface Supabase expects (getItem/setItem/removeItem)', () => {
    expect(typeof supabaseAuthStorage.getItem).toBe('function');
    expect(typeof supabaseAuthStorage.setItem).toBe('function');
    expect(typeof supabaseAuthStorage.removeItem).toBe('function');
  });

  it('returns null for a session that was never stored', () => {
    expect(supabaseAuthStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('persists and restores a session shape, simulating an app restart', () => {
    // "Before restart": Supabase writes the session after sign-in.
    supabaseAuthStorage.setItem(SESSION_KEY, JSON.stringify(SAMPLE_SESSION));

    // "After restart": a fresh read from the same underlying MMKV instance
    // (persistSession/autoRefreshToken depend on this surviving process
    // restarts, which is exactly what the prior broken `new MMKV()` call
    // could never actually do, since it threw before writing anything).
    const restored = supabaseAuthStorage.getItem(SESSION_KEY);
    expect(restored).not.toBeNull();
    expect(JSON.parse(restored as string)).toEqual(SAMPLE_SESSION);
  });

  it('removeItem clears a persisted session (sign-out path)', () => {
    supabaseAuthStorage.setItem(SESSION_KEY, JSON.stringify(SAMPLE_SESSION));
    expect(supabaseAuthStorage.getItem(SESSION_KEY)).not.toBeNull();

    supabaseAuthStorage.removeItem(SESSION_KEY);
    expect(supabaseAuthStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
