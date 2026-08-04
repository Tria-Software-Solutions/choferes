import React, { memo } from "react";
import { Box, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridValidRowModel } from "@mui/x-data-grid";

interface StickyDataGridProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  getRowId: (row: T) => number;
  /**
   * Desactiva la virtualización de filas mientras haya una fila en edición,
   * para que su celda (con inputs) no se desmonte al hacer scroll y no se
   * pierda el foco del texto a mitad de edición. Costo despreciable.
   */
  disableRowVirtualization?: boolean;
}

/**
 * StickyDataGrid - wrapper de MUI X Data Grid que garantiza header sticky de forma
 * arquitectónica: el header se renderiza en una capa separada que NO scrollea con las
 * filas (a diferencia de `position: sticky` puro). Mantiene el look & feel de la app:
 * franja negra en el header, texto blanco uppercase, filas con hover sutil.
 */
function StickyDataGridComponent<T extends GridValidRowModel>({
  rows,
  columns,
  getRowId,
  disableRowVirtualization = false,
}: StickyDataGridProps<T>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: "100%", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        hideFooter
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        // Virtualización habilitada por defecto (disableVirtualization=false): solo se
        // renderizan las filas visibles, lo que acelera el montaje con muchos registros.
        // Se desactiva solo mientras hay una fila en edición para no perder el foco.
        disableVirtualization={disableRowVirtualization}
        rowHeight={64}
        columnHeaderHeight={48}
        sx={{
          height: "100%",
          width: "100%",
          border: "none",
          borderRadius: 0,
          backgroundColor: "transparent",
          fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
          // Elimina los bordes/colores por defecto de MUI (todo se controla explícitamente)
          "--DataGrid-rowBorderColor": "transparent",
          "--DataGrid-containerBackground": "transparent",
          // ── Header moderno ──
          // Gradiente con brillo superior + sombra de profundidad que aparece al scrollear.
          // minWidth: sin esto el fondo del header solo cubre el viewport y, al hacer scroll
          // horizontal en mobile, los headers de las columnas de la derecha quedan sin fondo
          // (el header se ve "cortado"). rowWidth = max(viewport, ancho total de columnas).
          "& .MuiDataGrid-topContainer": {
            minWidth: "var(--DataGrid-rowWidth)",
            borderRadius: 0,
            borderBottom: "none",
            background: isDark
              ? "linear-gradient(180deg, #232323 0%, #0a0a0a 100%)"
              : "linear-gradient(180deg, #1c1c1c 0%, #000000 100%)",
            boxShadow: `0 3px 14px ${isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.14)"}`,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "transparent",
            color: "#ffffff",
            fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
            borderRadius: 0,
            borderBottom: "none",
            // Línea de acento inferior (línea única) + filo superior glass
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(255,255,255,0.14)",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "transparent",
            borderRadius: 0,
            borderBottom: "none",
            outline: "none",
            transition: "background-color 0.2s ease, box-shadow 0.2s ease",
            "&:focus, &:focus-within": { outline: "none" },
            // Indicador de foco por teclado: outline es propiedad separada,
            // así no lo sobrescriben los box-shadow de hover/sort
            "&:focus-visible": {
              outline: `2px solid ${
                isDark ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.6)"
              }`,
              outlineOffset: "-2px",
            },
            "&:hover": {
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
              boxShadow: `inset 0 -2px 0 ${
                isDark ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.55)"
              }`,
            },
            // Columna con sort activo: fondo resaltado + subrayado blanco persistente
            "&[aria-sort='ascending'], &[aria-sort='descending']": {
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.1)",
              boxShadow: "inset 0 -2px 0 #ffffff",
            },
            "&[aria-sort='ascending']:hover, &[aria-sort='descending']:hover": {
              backgroundColor: isDark ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.14)",
            },
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            color: "#ffffff",
            fontSize: "0.75rem",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          },
          "& .MuiDataGrid-sortIcon": {
            color: "#ffffff",
            opacity: 0.35,
            fontSize: "1.125rem",
            transition: "opacity 0.2s ease",
          },
          "& .MuiDataGrid-iconButtonContainer": {
            color: "#ffffff",
            opacity: 0.45,
            transition: "opacity 0.2s ease",
          },
          "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-sortIcon, & .MuiDataGrid-columnHeader:hover .MuiDataGrid-iconButtonContainer":
            { opacity: 1 },
          "& .MuiDataGrid-columnHeader[aria-sort='ascending'] .MuiDataGrid-sortIcon, & .MuiDataGrid-columnHeader[aria-sort='descending'] .MuiDataGrid-sortIcon":
            { opacity: 1 },
          "& .MuiDataGrid-columnSeparator": { display: "none" },
          // Celdas
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${
              isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
            }`,
            borderRight: `1px solid ${
              isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
            }`,
            fontSize: "0.875rem",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
            outline: "none",
            // Sin contorno/outline al enfocar la celda (evita el borde negro al editar inline)
            "&:focus, &:focus-within, &:focus-visible": { outline: "none", boxShadow: "none" },
          },
          // Contenido de la celda: centrado verticalmente y ocupando todo el ancho
          "& .MuiDataGrid-cellContent": {
            display: "flex",
            alignItems: "center",
            width: "100%",
            minWidth: 0,
            lineHeight: "normal",
          },
          "& .MuiDataGrid-row": {
            transition: "background 0.15s ease",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            },
          },
          "& .MuiDataGrid-main": { border: "none", outline: "none", borderRadius: 0 },
          "& .MuiDataGrid-filler": { borderRadius: 0, background: "transparent" },
          "& .MuiDataGrid-scrollbarFiller": { borderRadius: 0, background: "transparent" },
          "& .MuiDataGrid-virtualScroller": { outline: "none", borderRadius: 0 },
          "& .MuiDataGrid-overlay": { display: "none" },
          // ── Scrollbars visibles ──
          // MUI v7 oculta los scrollbars nativos y usa scrollbars "fake" flotantes;
          // sin estilos explícitos quedan casi invisibles en macOS/iOS y el contenido
          // cortado (header incluido) no se ve scrollable en mobile.
          "& .MuiDataGrid-scrollbar--horizontal": {
            height: 14,
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            zIndex: 70,
          },
          "& .MuiDataGrid-scrollbar--horizontal > div": {
            backgroundColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
            borderRadius: "7px",
            opacity: 0.9,
          },
          "& .MuiDataGrid-scrollbar--vertical": {
            width: 14,
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            zIndex: 70,
          },
          "& .MuiDataGrid-scrollbar--vertical > div": {
            backgroundColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
            borderRadius: "7px",
            opacity: 0.9,
          },
        }}
      />
    </Box>
  );
}

export default memo(StickyDataGridComponent) as typeof StickyDataGridComponent;
