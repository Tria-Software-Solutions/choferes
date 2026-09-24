/**
 * In-memory token store (no localStorage / JS cookies).
 *
 * Trusted credentials live ONLY in httpOnly cookies set server-side (see
 * utils/generateSecret.ts). This module mirrors the previous
 * get/set/remove token API so callers keep working unchanged, but tokens are
 * never persisted anywhere a script can read them (XSS leak vector).
 *
 * On a hard reload the memory is empty and requests simply ride on the
 * httpOnly cookies; the backend accepts cookies as a token source.
 */
const tokens = new Map<string, string>();

export const setTokenWithFallback = (key: string, value: string) => {
  tokens.set(key, value);
};

export const getTokenWithFallback = (key: string): string | null => {
  return tokens.get(key) ?? null;
};

export const removeTokenWithFallback = (key: string) => {
  tokens.delete(key);
};