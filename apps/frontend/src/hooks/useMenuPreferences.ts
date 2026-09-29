import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'menuPreferences';

// Se incrementa cuando cambia el orden por defecto del menú (por ejemplo, al
// insertar una página nueva en medio): los órdenes guardados con una versión
// anterior se vuelven a sembrar para que la página nueva quede donde se define
// en lugar del final del dock.
const MENU_ORDER_VERSION = 2;

export const MENU_PREFERENCES_EVENT = 'menuPreferencesChanged';

export interface MenuPreferences {
  [key: string]: boolean;
}

export function useMenuPreferences(menuKeys: string[]) {
  const readPreferences = useCallback((): MenuPreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only keep keys that are in the current menu set
        const valid: MenuPreferences = {};
        let hasValid = false;
        for (const key of menuKeys) {
          valid[key] = parsed[key] !== false; // default to true if not set
          if (parsed[key] !== undefined) hasValid = true;
        }
        return hasValid ? valid : getDefaults(menuKeys);
      }
    } catch {
      // ignore parse errors
    }
    return getDefaults(menuKeys);
  }, [menuKeys]);

  const readOrder = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Un orden guardado antes del orden canónico actual mantendría las
        // páginas nuevas al final, así que se vuelve a sembrar.
        if (parsed._orderVersion === MENU_ORDER_VERSION && Array.isArray(parsed._order)) {
          const valid: string[] = parsed._order.filter((k: string) => menuKeys.includes(k));
          // Las páginas añadidas después vuelven a su posición canónica (justo
          // detrás de la anterior del menú) en lugar del final del dock.
          menuKeys.forEach((key, index) => {
            if (valid.includes(key)) return;
            const anchor = menuKeys
              .slice(0, index)
              .reverse()
              .find((candidate) => valid.includes(candidate));
            if (anchor) valid.splice(valid.indexOf(anchor) + 1, 0, key);
            else valid.unshift(key);
          });
          return valid;
        }
      }
    } catch {
      // ignore
    }
    return [...menuKeys];
  }, [menuKeys]);

  const [preferences, setPreferences] = useState<MenuPreferences>(readPreferences);
  const [itemOrder, setItemOrder] = useState<string[]>(readOrder);

  // Keep multiple instances (e.g. AppBar dock + Profile tab) in sync
  useEffect(() => {
    const handleChange = () => {
      setPreferences(readPreferences());
      setItemOrder(readOrder());
    };
    window.addEventListener(MENU_PREFERENCES_EVENT, handleChange);
    return () => window.removeEventListener(MENU_PREFERENCES_EVENT, handleChange);
  }, [readPreferences, readOrder]);

  const saveAll = useCallback((prefs: MenuPreferences, order: string[]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, _order: order, _orderVersion: MENU_ORDER_VERSION }),
    );
    window.dispatchEvent(new Event(MENU_PREFERENCES_EVENT));
  }, []);

  const toggleMenu = useCallback((key: string) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveAll(next, itemOrder);
      return next;
    });
  }, [saveAll, itemOrder]);

  const isMenuVisible = useCallback((key: string) => {
    return preferences[key] !== false;
  }, [preferences]);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItemOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      saveAll(preferences, next);
      return next;
    });
  }, [preferences, saveAll]);

  const resetDefaults = useCallback(() => {
    const defaults = getDefaults(menuKeys);
    const defaultOrder = [...menuKeys];
    setPreferences(defaults);
    setItemOrder(defaultOrder);
    saveAll(defaults, defaultOrder);
  }, [menuKeys, saveAll]);

  return {
    preferences,
    itemOrder,
    toggleMenu,
    isMenuVisible,
    moveItem,
    resetDefaults,
  };
}

function getDefaults(keys: string[]): MenuPreferences {
  const defaults: MenuPreferences = {};
  for (const key of keys) {
    defaults[key] = true;
  }
  return defaults;
}
