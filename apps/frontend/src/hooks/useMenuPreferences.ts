import { useState, useCallback } from 'react';

const STORAGE_KEY = 'menuPreferences';

export interface MenuPreferences {
  [key: string]: boolean;
}

export function useMenuPreferences(menuKeys: string[]) {
  const [preferences, setPreferences] = useState<MenuPreferences>(() => {
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
  });

  // Item order state (stored separately in localStorage)
  const [itemOrder, setItemOrder] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed._order)) {
          // Only keep valid keys and add any missing ones at the end
          const valid = parsed._order.filter((k: string) => menuKeys.includes(k));
          for (const key of menuKeys) {
            if (!valid.includes(key)) valid.push(key);
          }
          return valid;
        }
      }
    } catch {
      // ignore
    }
    return [...menuKeys];
  });

  const saveAll = useCallback((prefs: MenuPreferences, order: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, _order: order }));
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
