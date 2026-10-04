import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import type { GridColDef, GridValidRowModel } from "@mui/x-data-grid";

interface GridCardListProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  getRowId: (row: T) => number;
}

// Columnas anchas (p. ej. los círculos de días de un horario) ocupan toda la fila
// de la tarjeta; si no, quedarían cortadas en un tercio del ancho.
const isWideColumn = (col: GridColDef) => (col.minWidth ?? 0) >= 200 || (col.flex ?? 0) >= 1.5;

const isActionsColumn = (col: GridColDef) =>
  col.type === "actions" || col.field === "actions" || col.field === "acciones";

// Valor de la celda tal como lo calcularía la tabla (valueGetter o campo).
const cellValue = <T extends GridValidRowModel>(col: GridColDef<T>, row: T) => {
  const raw = (row as Record<string, unknown>)[col.field];
  try {
    return col.valueGetter
      ? (col.valueGetter as (v: unknown, r: T, c: GridColDef<T>, a: unknown) => unknown)(raw, row, col, { current: {} })
      : raw;
  } catch {
    return raw;
  }
};

// Contenido de la celda: su `renderCell` si existe (así conserva chips, íconos y
// acciones), y si falla o no hay, el valor como texto.
const renderCellContent = <T extends GridValidRowModel>(col: GridColDef<T>, row: T, id: number) => {
  const value = cellValue(col, row);
  if (col.renderCell) {
    try {
      return col.renderCell({
        id,
        row,
        field: col.field,
        value,
        formattedValue: value,
        colDef: col,
        hasFocus: false,
        tabIndex: -1,
        cellMode: "view",
        isEditable: false,
        api: { current: {} },
      } as never);
    } catch {
      /* cae al texto */
    }
  }
  return value == null || value === "" ? "—" : String(value);
};

// Una tabla de MUI X en teléfonos: cada fila es una tarjeta con la primera
// columna como título, el resto como pares etiqueta/valor y las acciones al pie.
function GridCardList<T extends GridValidRowModel>({ rows, columns, getRowId }: GridCardListProps<T>) {
  const { colors, borders } = useTheme().tokens;
  const dataColumns = columns.filter((c) => !isActionsColumn(c));
  const actionColumn = columns.find(isActionsColumn);
  const [titleColumn, ...detailColumns] = dataColumns;

  return (
    <Box role="list">
      {rows.map((row) => {
        const id = getRowId(row);
        return (
          <Box
            role="listitem"
            key={id}
            sx={{ px: 2, py: 1.5, backgroundColor: colors.surface, borderBottom: borders.hairline }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              {titleColumn && (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0, fontWeight: 700, fontSize: "0.9375rem" }}>
                  {renderCellContent(titleColumn, row, id)}
                </Box>
              )}
              {actionColumn && (
                <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {renderCellContent(actionColumn, row, id)}
                </Box>
              )}
            </Box>
            {detailColumns.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1.25, columnGap: 2, mt: 1.25 }}>
                {detailColumns.map((col) => (
                  <Box key={col.field} sx={{ minWidth: 0, gridColumn: isWideColumn(col) ? "1 / -1" : undefined }}>
                    {col.headerName && (
                      <Typography
                        sx={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: colors.textMuted,
                          mb: 0.25,
                        }}
                      >
                        {col.headerName}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, fontSize: "0.875rem", fontWeight: 500 }}>
                      {renderCellContent(col, row, id)}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default GridCardList;
