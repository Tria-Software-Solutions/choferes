// Utility for persisting table preferences (rowsPerPage, search) in localStorage

export interface TablePreferences {
  rowsPerPage: number;
  search: string;
}

const STORAGE_KEY = 'tablePreferences';

// Get all preferences object from localStorage
function getAllPreferences(): Record<string, TablePreferences> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save all preferences object to localStorage
function setAllPreferences(prefs: Record<string, TablePreferences>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

// Get preferences for a specific table (by key)
export function getTablePreferences(tableKey: string): TablePreferences | undefined {
  const all = getAllPreferences();
  return all[tableKey];
}

// Set preferences for a specific table (by key)
export function setTablePreferences(tableKey: string, prefs: TablePreferences) {
  const all = getAllPreferences();
  all[tableKey] = prefs;
  setAllPreferences(all);
} 