// Navegación móvil (iOS / Android): lógica pura, sin React ni DOM, para que la
// web móvil y una app Expo/React Native decidan igual qué va en la barra de
// pestañas y qué en "Más".

/** Pestañas visibles en la barra inferior, contando la pestaña "Más". */
export const MOBILE_MAX_TABS = 5;

export interface MobileTabSplit<T> {
  tabs: T[];
  more: T[];
}

/**
 * Reparte los destinos (ya filtrados por permisos y ordenados por el usuario):
 * las primeras `maxTabs - 1` van en la barra y el resto queda en "Más", que
 * siempre ocupa la última pestaña (ahí viven también la cuenta y cerrar sesión).
 */
export const splitMobileTabs = <T>(
  items: readonly T[],
  maxTabs: number = MOBILE_MAX_TABS,
): MobileTabSplit<T> => ({
  tabs: items.slice(0, maxTabs - 1),
  more: items.slice(maxTabs - 1),
});

/**
 * Ruta "padre" para el botón atrás de una pantalla de detalle:
 * `/employees/12` → `/employees`. Las pantallas de primer nivel devuelven null.
 */
export const getParentRoute = (pathname: string): string | null => {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 1 ? `/${segments.slice(0, -1).join("/")}` : null;
};
