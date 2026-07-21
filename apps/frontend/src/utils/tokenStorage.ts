import Cookies from "js-cookie";

/**
 * Set a token in both cookie and localStorage (with localStorage fallback).
 * This dual-storage approach ensures tokens survive in case cookies are blocked.
 */
export const setTokenWithFallback = (key: string, value: string, options?: Cookies.CookieAttributes) => {
  try {
    // Try to set cookie first
    Cookies.set(key, value, options);
    // Also store in localStorage as backup
    localStorage.setItem(key, value);
  } catch {
    // Fallback to localStorage only
    localStorage.setItem(key, value);
  }
};

/**
 * Get a token from cookie first, with localStorage fallback.
 */
export const getTokenWithFallback = (key: string): string | null => {
  try {
    // Try to get from cookie first
    const cookieValue = Cookies.get(key);
    if (cookieValue) return cookieValue;

    // Fallback to localStorage
    return localStorage.getItem(key);
  } catch {
    // Fallback to localStorage only
    return localStorage.getItem(key);
  }
};

/**
 * Remove a token from both cookie and localStorage.
 */
export const removeTokenWithFallback = (key: string, options?: Cookies.CookieAttributes) => {
  try {
    // Try to remove from cookie first
    Cookies.remove(key, options);
    // Also remove from localStorage
    localStorage.removeItem(key);
  } catch {
    // Fallback to localStorage only
    localStorage.removeItem(key);
  }
};
