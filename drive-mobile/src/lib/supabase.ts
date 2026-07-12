import { createClient } from '@supabase/supabase-js';
import { storage } from './mmkv';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Only the anon key is ever present on the client. The service-role key
// used by client.server.ts-style trusted operations exists only in Edge
// Function environment variables (see supabase/functions/*), never here.

// Wraps the shared, encrypted MMKV instance (see mmkv.ts) to satisfy
// Supabase's SupportedStorage interface. MMKV's get/set/delete are
// synchronous; supabase-js accepts either sync or async storage
// implementations and awaits the result either way.
const supabaseAuthStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseAuthStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
