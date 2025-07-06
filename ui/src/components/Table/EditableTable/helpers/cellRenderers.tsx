import React from "react";
import { Box, Typography, Stack, Theme, SxProps } from "@mui/material";
import { capitalizeFirstLetter, translateDayOptionsToSpanish } from "../../../../utils/string";
import { formatDateWithDay } from "../../../../utils/dates";
import { permissionChipStyles, emailLinkStyles, viewMoreLessStyles } from "../EditableTable.styles";

export function renderCellValue<T extends object>({
  column,
  value,
  row,
  theme,
  expandedRows,
  expandRow,
  collapseRow,
  rowId,
  TABLE_UI,
  tableCellStyles,
}: {
  column: keyof T;
  value: unknown;
  row: T;
  theme: Theme;
  expandedRows: Record<number, boolean>;
  expandRow: (rowId: number) => void;
  collapseRow: (rowId: number) => void;
  rowId: number;
  TABLE_UI: { VIEW_MORE: string; VIEW_LESS: string };
  tableCellStyles: SxProps<Theme>;
}): React.ReactNode {
  const isPermissionNames = column === "permissionNames";
  if (
    isPermissionNames &&
    Array.isArray(value)
  ) {
    const expanded = !!expandedRows[rowId];
    const maxVisible = 6;
    const showAll = expanded && value.length > maxVisible;
    const visible = showAll ? value : value.slice(0, maxVisible);
    const hiddenCount = value.length - maxVisible;
    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          py: 0.5,
          minHeight: 36,
        }}
      >
        {visible.map((perm: string) => (
          <Box key={perm} sx={permissionChipStyles(theme)}>
            {perm}
          </Box>
        ))}
        {hiddenCount > 0 && !expanded && (
          <Typography
            sx={viewMoreLessStyles(theme)}
            onClick={() => expandRow(rowId)}
          >
            {TABLE_UI.VIEW_MORE}
          </Typography>
        )}
        {showAll && (
          <Typography
            sx={viewMoreLessStyles(theme)}
            onClick={() => collapseRow(rowId)}
          >
            {TABLE_UI.VIEW_LESS}
          </Typography>
        )}
      </Box>
    );
  }
  if (column === "days" && Array.isArray(value)) {
    return (
      <Typography component="span">
        {value
          .map((d: string) =>
            capitalizeFirstLetter(translateDayOptionsToSpanish(String(d)))
          )
          .join(", ")}
      </Typography>
    );
  }
  if (Array.isArray(value)) {
    return (
      <Stack direction="row" spacing={1} sx={{ rowGap: 2, flexWrap: "nowrap" }}>
        {value.map((item: string, index: number, array: string[]) => (
          <Typography key={index} component="span">
            {item}
            {index < array.length - 1 ? ", " : ""}
          </Typography>
        ))}
      </Stack>
    );
  }
  if (column === "email") {
    return (
      <Typography
        component="a"
        href={`mailto:${String(value ?? "")}`}
        sx={emailLinkStyles(theme)}
      >
        {String(value ?? "")}
      </Typography>
    );
  }
  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    // ISO date string
    return (
      <Typography component="span">
        {value ? formatDateWithDay(new Date(value), false) : ""}
      </Typography>
    );
  }
  return <Typography component="span">{String(value ?? "")}</Typography>;
} 