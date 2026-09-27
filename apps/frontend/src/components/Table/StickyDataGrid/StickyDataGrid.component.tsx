import React, { memo } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
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
  /** Altura de cada fila en píxeles. Útil aumentarla cuando hay una fila en edición. */
  rowHeight?: number;
}

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
}: StickyDataGridProps<T>) {
  const theme = useTheme();
  const { colors, borders } = theme.tokens;
  // Below md the page scrolls as a whole (see components/Layout), so the grid
  // grows with its rows instead of scrolling inside a cramped box.
  const flowLayout = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: flowLayout ? "auto" : "100%", width: "100%" }}>
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
