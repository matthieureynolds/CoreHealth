/**
 * C14 — Encrypted local storage for sensitive health data.
 *
 * Strategy:
 * - A random 256-bit AES-GCM key is generated on first launch and stored in
 *   expo-secure-store (iOS Keychain / Android Keystore — hardware-backed).
 * - All health data written through this module is encrypted with that key
 *   before being placed in AsyncStorage.
 * - On sign-out, all sensitive cache keys are erased (see clearHealthCache()).
 *
 * Falls back to plain AsyncStorage if expo-secure-store is unavailable (e.g. Expo Go).
 * Legacy plaintext values are returned as-is and re-encrypted on next write.
 *
 * Prerequisites:
 *   npx expo install expo-secure-store
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Lazy-import so the module doesn't hard-crash if expo-secure-store isn't installed
let SecureStore: typeof import("expo-secure-store") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SecureStore = require("expo-secure-store");
} catch {
  console.warn(
    "[secureStorage] expo-secure-store not available — falling back to plaintext AsyncStorage. Run: npx expo install expo-secure-store",
  );
}

const MASTER_KEY_STORE_KEY = "ch_storage_master_key_v1";
const ENC_PREFIX = "enc1:"; // versioned prefix so we can migrate later

let cachedKeyMaterial: CryptoKey | null = null;

async function getMasterKey(): Promise<CryptoKey | null> {
  if (cachedKeyMaterial) return cachedKeyMaterial;
  if (!SecureStore) return null;

  try {
    let rawKeyHex = await SecureStore.getItemAsync(MASTER_KEY_STORE_KEY);
    if (!rawKeyHex) {
      // Generate a new 256-bit key and persist to Keychain/Keystore
      const keyBytes = crypto.getRandomValues(new Uint8Array(32));
      rawKeyHex = Array.from(keyBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      await SecureStore.setItemAsync(MASTER_KEY_STORE_KEY, rawKeyHex, {
        requireAuthentication: false, // don't require biometrics so the app can read on background
      });
    }

    const keyBytes = new Uint8Array(
      rawKeyHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)),
    );
    cachedKeyMaterial = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
    return cachedKeyMaterial;
  } catch (e) {
    console.error("[secureStorage] Failed to initialise master key:", e);
    return null;
  }
}

async function encryptValue(plaintext: string): Promise<string> {
  const key = await getMasterKey();
  if (!key) return plaintext; // fallback — no encryption if Keychain unavailable

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return ENC_PREFIX + btoa(String.fromCharCode(...combined));
}

async function decryptValue(stored: string): Promise<string> {
  if (!stored.startsWith(ENC_PREFIX)) return stored; // legacy plaintext — return as-is

  const key = await getMasterKey();
  if (!key) return stored;

  try {
    const combined = Uint8Array.from(
      atob(stored.slice(ENC_PREFIX.length)),
      (c) => c.charCodeAt(0),
    );
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    // Decryption failed (wrong key, corrupted data) — return null so caller re-fetches from server
    return "";
  }
}

// ─── Sensitive health data keys (all go through encryption) ──────────────────

export const SENSITIVE_KEYS = [
  "profile",
  "biomarkers",
  "labResults",
  "deviceData",
  "healthScore",
  "dailyInsights",
  "derivedRiskFeatures",
  "connectedDevices",
  "jetLagPlanningEvents",
  "@corehealth_pending_consent",
] as const;

export type SensitiveKey = (typeof SENSITIVE_KEYS)[number];

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await encryptValue(value);
    await AsyncStorage.setItem(key, encrypted);
  },

  async getItem(key: string): Promise<string | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return decryptValue(raw);
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

/**
 * Clear all sensitive health data from local cache.
 * Called on sign-out and account deletion.
 * Server copy is unaffected.
 */
export async function clearHealthCache(): Promise<void> {
  await AsyncStorage.multiRemove([...SENSITIVE_KEYS]);
}
