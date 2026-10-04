// Medidas del shell móvil. Las alturas siguen las guías de iOS (HIG) y
// Material 3: barra superior de 44/56 px, barra inferior de 49/80 px y objetivos
// táctiles de al menos 44 px.
export const MOBILE_TOP_BAR_HEIGHT = 52;
export const MOBILE_TAB_BAR_HEIGHT = 56;

export const SAFE_AREA_TOP = "env(safe-area-inset-top, 0px)";
export const SAFE_AREA_BOTTOM = "env(safe-area-inset-bottom, 0px)";

/** Alto total de la barra inferior, incluida el área segura del dispositivo. */
export const TAB_BAR_TOTAL_HEIGHT = `calc(${MOBILE_TAB_BAR_HEIGHT}px + ${SAFE_AREA_BOTTOM})`;
/** Alto total de la barra superior, incluida el área segura del dispositivo. */
export const TOP_BAR_TOTAL_HEIGHT = `calc(${MOBILE_TOP_BAR_HEIGHT}px + ${SAFE_AREA_TOP})`;

// Retroalimentación al tocar: en pantallas táctiles no hay hover, así que el
// estado "presionado" es el único feedback.
export const pressable = {
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
  userSelect: "none",
  transition: "opacity 0.12s ease, transform 0.12s ease",
  "&:active": { opacity: 0.6, transform: "scale(0.97)" },
} as const;
