import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface ScreenChrome {
  /** Título que reemplaza al de la sección (p. ej. el nombre del empleado). */
  title: string | null;
  /** Si existe, la barra muestra "atrás" y lo ejecuta (navegación interna de una pantalla). */
  onBack: (() => void) | null;
}

interface ScreenChromeContextValue {
  chrome: ScreenChrome;
  setChrome: (chrome: ScreenChrome) => void;
}

const EMPTY: ScreenChrome = { title: null, onBack: null };

const ScreenChromeContext = createContext<ScreenChromeContextValue>({
  chrome: EMPTY,
  setChrome: () => undefined,
});

export const ScreenTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chrome, setChrome] = useState<ScreenChrome>(EMPTY);
  const value = useMemo(() => ({ chrome, setChrome }), [chrome]);
  return <ScreenChromeContext.Provider value={value}>{children}</ScreenChromeContext.Provider>;
};

/** Lo que la pantalla activa pidió mostrar en la barra superior. */
export const useScreenChrome = (): ScreenChrome => useContext(ScreenChromeContext).chrome;

/**
 * Una pantalla fija su título (y opcionalmente su botón atrás) en la barra
 * superior; al salir de ella la barra vuelve a la sección. Sin shell móvil no
 * hay proveedor y no hace nada.
 */
export const useMobileScreenTitle = (
  title: string | null | undefined,
  onBack?: (() => void) | null,
): void => {
  const { setChrome } = useContext(ScreenChromeContext);
  // `onBack` suele ser una función nueva en cada render: se guarda en un ref
  // para no reasignar la barra en cada cambio.
  const backRef = React.useRef(onBack ?? null);
  backRef.current = onBack ?? null;
  const hasBack = Boolean(onBack);
  useEffect(() => {
    setChrome({ title: title || null, onBack: hasBack ? () => backRef.current?.() : null });
    return () => setChrome(EMPTY);
  }, [title, hasBack, setChrome]);
};
