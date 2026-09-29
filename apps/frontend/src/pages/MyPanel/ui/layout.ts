import type { SxProps, Theme } from "@mui/material/styles";

// Maquetación de las pestañas de Mi Panel. En pantallas anchas cada pestaña
// ocupa todo el alto disponible: la raíz crece hasta el fondo (sin encogerse por
// debajo de su contenido, así que si no cabe la página se desplaza) y la última
// fila de tarjetas se estira, para que nunca quede un hueco vacío abajo.

export const TAB_GAP = { xs: 1.5, md: 2 } as const;

/** Raíz de una pestaña: columna que llena el alto del área de contenido. */
export const tabRootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: TAB_GAP,
  flex: "1 0 auto",
};

/** Rejilla de 12 columnas (una sola bajo `md`) cuyas tarjetas comparten la altura de la fila. */
export const gridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(12, minmax(0, 1fr))" },
  gap: TAB_GAP,
};

/** Igual que `gridSx`, pero crece para ocupar el alto que sobre (la fila final de la pestaña). */
export const fillGridSx: SxProps<Theme> = { ...(gridSx as object), flex: "1 0 auto" };

/** Columnas que ocupa una tarjeta dentro de la rejilla de 12. */
export const span = (columns: number) => ({ gridColumn: { md: `span ${columns}` } });

/** Columna que apila tarjetas; la última (con `flex: 1`) se estira hasta abajo. */
export const stackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: TAB_GAP,
  minWidth: 0,
};
