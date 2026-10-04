import React, { memo, useEffect, useRef } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridValidRowModel, GridRowHeightParams } from "@mui/x-data-grid";
import { useMobileShell } from "../../../hooks/useMobileShell";
import GridCardList from "./GridCardList";

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
  /** Altura fija para todas las filas (fallback). */
  rowHeight?: number;
  /** Función para altura dinámica por fila. Si se provee, tiene prioridad sobre rowHeight. */
  getRowHeight?: (params: GridRowHeightParams) => number;
  /**
   * Si se indica, la posición de scroll de la tabla se recuerda con esta clave
   * y se restaura al volver a la página (p. ej. tras abrir un detalle).
   */
  scrollKey?: string;
  /** En teléfonos la tabla se muestra como lista de tarjetas (por defecto). */
  mobileList?: boolean;
}

// Posición de scroll por tabla; vive en memoria mientras dure la sesión de la app.
const savedScroll = new Map<string, number>();

/**
 * StickyDataGrid - wrapper de MUI X Data Grid con el estilo de tabla de la app:
 * cabecera tenue con etiquetas pequeñas en mayúsculas (fija al hacer scroll),
 * filas separadas por líneas finas y hover sutil. Todos los colores salen de
 * los tokens del theme, así que se ve igual en claro y oscuro.
 */
function StickyDataGridComponent<T extends GridValidRowModel>({
  rows,
  columns,
  getRowId,
  disableRowVirtualization = false,
  rowHeight = 60,
  getRowHeight,
  scrollKey,
  mobileList = true,
}: StickyDataGridProps<T>) {
  const isMobileShell = useMobileShell();
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  // Below md the page scrolls as a whole (see components/Layout), so the grid
  // grows with its rows instead of scrolling inside a cramped box.
  const flowLayout = useMediaQuery(theme.breakpoints.down("md"));

  const containerRef = useRef<HTMLDivElement>(null);

  // Restaura el scroll guardado y lo va guardando mientras el usuario se mueve.
  useEffect(() => {
    if (!scrollKey || flowLayout) return undefined;

    let frame = 0;
    let attempts = 0;
    let scroller: HTMLElement | null = null;
    const target = savedScroll.get(scrollKey) ?? 0;
    const onScroll = () => {
      if (scroller) savedScroll.set(scrollKey, scroller.scrollTop);
    };

    // El grid puede tardar unos cuadros en montar su contenedor y en tener alto
    // suficiente para el offset guardado: se reintenta brevemente.
    const attach = () => {
      scroller ??= containerRef.current?.querySelector<HTMLElement>(
        ".MuiDataGrid-virtualScroller",
      ) ?? null;
      attempts += 1;
      if (scroller) {
        if (target > 0) scroller.scrollTop = target;
        if (!scroller.dataset.scrollTracked) {
          scroller.dataset.scrollTracked = "1";
          scroller.addEventListener("scroll", onScroll, { passive: true });
        }
        if (target === 0 || Math.abs(scroller.scrollTop - target) <= 1) return;
      }
      if (attempts < 30) frame = requestAnimationFrame(attach);
    };
    attach();

    return () => {
      cancelAnimationFrame(frame);
      scroller?.removeEventListener("scroll", onScroll);
    };
  }, [scrollKey, flowLayout]);

  if (isMobileShell && mobileList) {
    return <GridCardList rows={rows} columns={columns} getRowId={getRowId} />;
  }

  return (
    <Box
      ref={containerRef}
      sx={{ flex: 1, minHeight: 0, height: flowLayout ? "auto" : "100%", width: "100%" }}
    >
      <DataGrid
        autoHeight={flowLayout}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        hideFooter
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        // Virtualización habilitada por defecto: solo se renderizan las filas
        // visibles. Se desactiva mientras hay una fila en edición.
        disableVirtualization={disableRowVirtualization}
        rowHeight={rowHeight}
        getRowHeight={getRowHeight}
        columnHeaderHeight={42}
        sx={{
          height: flowLayout ? "auto" : "100%",
          width: "100%",
          border: "none",
          borderRadius: 0,
          backgroundColor: "transparent",
          color: colors.text,
          fontFamily: "inherit",
          "--DataGrid-rowBorderColor": colors.borderHairline,
          "--DataGrid-containerBackground": colors.tableHeadBg,
          "--DataGrid-pinnedBackground": colors.surface,

          // ── Header ──
          // minWidth: sin esto el fondo del header solo cubre el viewport y, al
          // hacer scroll horizontal, las columnas de la derecha quedan sin fondo.
          "& .MuiDataGrid-topContainer": {
            minWidth: "var(--DataGrid-rowWidth)",
            backgroundColor: colors.tableHeadBg,
            borderBottom: borders.headCell,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.tableHeadBg,
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: colors.tableHeadBg,
            outline: "none",
            px: 2,
            "&:focus, &:focus-within": { outline: "none" },
            "&:focus-visible": { outline: borders.focus, outlineOffset: "-2px" },
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
            color: colors.tableHeadText,
            fontSize: "0.6875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          },
          "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-columnHeaderTitle, & .MuiDataGrid-columnHeader[aria-sort='ascending'] .MuiDataGrid-columnHeaderTitle, & .MuiDataGrid-columnHeader[aria-sort='descending'] .MuiDataGrid-columnHeaderTitle":
            { color: colors.text },
          "& .MuiDataGrid-sortIcon, & .MuiDataGrid-iconButtonContainer": {
            color: colors.textMuted,
          },
          "& .MuiDataGrid-iconButtonContainer .MuiIconButton-root": { padding: "2px" },
          "& .MuiDataGrid-columnSeparator": { display: "none" },

          // ── Cells ──
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            px: 2,
            borderTop: "none",
            borderBottom: borders.hairline,
            fontSize: "0.875rem",
            fontWeight: 500,
            color: colors.textOnSunken,
            outline: "none",
            "&:focus, &:focus-within, &:focus-visible": { outline: "none", boxShadow: "none" },
          },
          "& .MuiDataGrid-cellContent": {
            display: "flex",
            alignItems: "center",
            width: "100%",
            minWidth: 0,
            lineHeight: "normal",
          },
          "& .MuiDataGrid-row": {
            transition: "background-color 0.12s ease",
            "&:hover": { backgroundColor: colors.hoverSoft },
            "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: colors.selected },
          },
          "& .MuiDataGrid-main": { border: "none", outline: "none" },
          "& .MuiDataGrid-filler": { background: "transparent" },
          "& .MuiDataGrid-scrollbarFiller": { background: colors.tableHeadBg },
          "& .MuiDataGrid-virtualScroller": { outline: "none" },
          "& .MuiDataGrid-overlay": { display: "none" },

          // ── Scrollbars ──
          "& .MuiDataGrid-scrollbar--horizontal": { height: 10, zIndex: 70 },
          "& .MuiDataGrid-scrollbar--vertical": { width: 10, zIndex: 70 },
          "& .MuiDataGrid-scrollbar > div": { borderRadius: 8 },
        }}
      />
    </Box>
  );
}

export default memo(StickyDataGridComponent) as typeof StickyDataGridComponent;
