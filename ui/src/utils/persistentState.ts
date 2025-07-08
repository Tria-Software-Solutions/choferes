// Utility for persisting simple values (like date strings) in localStorage

export function getPersistentValue<T = string>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch {}
  return fallback;
}

export function setPersistentValue<T = string>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Utility for persisting preferences objects (date, search, rowsPerPage, etc.) in localStorage per page

export function getPreferencesObject<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch {}
  return fallback;
}

export function setPreferencesObject<T extends object>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
} 