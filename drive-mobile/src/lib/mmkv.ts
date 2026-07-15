import { createMMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// The previous version of this file did `import { MMKV } from
// 'react-native-mmkv'; new MMKV()` — but this installed version (Nitro-
// based) never exported a constructible `MMKV` class, only the
// `createMMKV(config)` factory used below. `new MMKV()` throws at runtime
// ("MMKV is not a constructor") on a real device; it only ever "worked" in
// this repo's tests because of a hand-written Jest mock that happened to
// define a class named MMKV. There is no prior on-device data to migrate,
// since local storage effectively never worked before this fix.

const ENCRYPTION_KEY_STORE_KEY = 'drive_mmkv_encryption_key_v1';

// The encryption key is generated once (cryptographically random, via
// expo-crypto's synchronous getRandomBytes) and persisted in the OS-level
// secure store (iOS Keychain / Android Keystore-backed
// EncryptedSharedPreferences via expo-secure-store) rather than hardcoded,
// so it survives app restarts (deterministic — required for MMKV to be
// able to decrypt what it previously wrote) but is not itself readable
// from the app's plaintext storage or source code.
function getOrCreateEncryptionKey(): string {
  const existing = SecureStore.getItem(ENCRYPTION_KEY_STORE_KEY);
  if (existing) return existing;

  const randomBytes = Crypto.getRandomBytes(32);
  const newKey = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  SecureStore.setItem(ENCRYPTION_KEY_STORE_KEY, newKey);
  return newKey;
}

// Single shared, encrypted, on-device store for everything sensitive this
// app persists locally: GPS telemetry (useDriveStore), the pending sync
// queue (SyncWorker), and the Supabase auth session (supabase.ts).
export const storage = createMMKV({
  id: 'drive-secure-storage',
  encryptionKey: getOrCreateEncryptionKey(),
  encryptionType: 'AES-256',
});
