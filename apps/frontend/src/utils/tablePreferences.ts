// Utility for persisting table preferences (rowsPerPage, search) in localStorage

export interface TablePreferences {
  rowsPerPage: number;
  search: string;
  // Filtro de estado del listado (p. ej. Todos / Activos / Inactivos).
  // Opcional para no romper las tablas que no lo usan.
  statusFilter?: string;
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

// Los listados de Personal y Roles abren en "Activos". Antes el valor por
// defecto era "Todos" y quedó guardado en el navegador de quien ya había
// visitado la página, así que una sola vez se reescribe esa preferencia. Se
// aplica por tabla y no se tocan filas por página ni búsqueda.
const ACTIVE_BY_DEFAULT_TABLES = ['employees', 'roles-selector', 'users'];
const ACTIVE_BY_DEFAULT_FLAG = 'tablePreferences.activeByDefaultApplied';

export function enforceActiveStatusFilterByDefault() {
  try {
    if (localStorage.getItem(ACTIVE_BY_DEFAULT_FLAG)) return;

    const all = getAllPreferences();
    ACTIVE_BY_DEFAULT_TABLES.forEach((tableKey) => {
      const prefs = all[tableKey];
      if (prefs?.statusFilter && prefs.statusFilter !== 'active') {
        all[tableKey] = { ...prefs, statusFilter: 'active' };
      }
    });
    setAllPreferences(all);
    localStorage.setItem(ACTIVE_BY_DEFAULT_FLAG, '1');
  } catch {
    // localStorage no disponible (modo privado): el valor por defecto de la
    // tabla sigue siendo "Activos", solo no se recuerda entre navegaciones.
  }
}