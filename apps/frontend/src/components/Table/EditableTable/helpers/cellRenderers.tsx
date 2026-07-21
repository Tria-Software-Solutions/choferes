import React, { useMemo } from "react";
import { Box, Typography, Stack, Theme } from "@mui/material";
import { capitalizeFirstLetter, translateDayOptionsToSpanish } from "../../../../utils/string";
import { formatDateWithDay } from "../../../../utils/dates";
import { permissionChipStyles, emailLinkStyles, viewMoreLessStyles } from "../EditableTable.styles";

interface CellRenderProps {
  column: string;
  value: unknown;
  theme: Theme;
  expanded: boolean;
  onToggleExpand: () => void;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}/;

export function PermissionCell({
  value,
  theme,
  expanded,
  onToggleExpand,
}: {
  value: string[];
  theme: Theme;
  expanded: boolean;
  onToggleExpand: () => void;
}): React.ReactElement {
  const { visible, hiddenCount, showAll } = useMemo(() => {
    const maxVisible = 6;
    const showAll = expanded && value.length > maxVisible;
    return {
      visible: showAll ? value : value.slice(0, maxVisible),
      hiddenCount: value.length - maxVisible,
      showAll,
    };
  }, [value, expanded]);

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
        <Typography sx={viewMoreLessStyles(theme)} onClick={onToggleExpand}>
          Ver más
        </Typography>
      )}
      {showAll && (
        <Typography sx={viewMoreLessStyles(theme)} onClick={onToggleExpand}>
          Ver menos
        </Typography>
      )}
    </Box>
  );
}

export function DaysCell({ value }: { value: string[] }): React.ReactElement {
  const text = useMemo(
    () =>
      value
        .map((d) => capitalizeFirstLetter(translateDayOptionsToSpanish(d)))
        .join(", "),
    [value]
  );

  return (
    <Typography component="span" variant="body2">
      {text}
    </Typography>
  );
}

export function ArrayCell({ value }: { value: string[] }): React.ReactElement {
  return (
    <Stack direction="row" spacing={1} sx={{ rowGap: 2, flexWrap: "nowrap" }}>
      {value.map((item, index, array) => (
        <Typography key={index} component="span" variant="body2">
          {item}
          {index < array.length - 1 ? ", " : ""}
        </Typography>
      ))}
    </Stack>
  );
}

export function EmailCell({ value, theme }: { value: string; theme: Theme }): React.ReactElement {
  const href = `mailto:${value}`;
  return (
    <Typography component="a" href={href} variant="body2" sx={emailLinkStyles(theme)}>
      {value}
    </Typography>
  );
}

export function DateCell({ value }: { value: string }): React.ReactElement {
  const formatted = useMemo(
    () => (value ? formatDateWithDay(new Date(value), false) : ""),
    [value]
  );
  return <Typography component="span" variant="body2">{formatted}</Typography>;
}

export function DefaultCell({ value }: { value: unknown }): React.ReactElement {
  return <Typography component="span" variant="body2">{String(value ?? "")}</Typography>;
}

export function renderCellValue({
  column,
  value,
  theme,
  expanded,
  onToggleExpand,
}: CellRenderProps): React.ReactNode {
  if (column === "permissionNames" && Array.isArray(value)) {
    return (
      <PermissionCell
        value={value}
        theme={theme}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  if (column === "days" && Array.isArray(value)) {
    return <DaysCell value={value} />;
  }

  if (Array.isArray(value)) {
    return <ArrayCell value={value} />;
  }

  if (column === "email" && typeof value === "string") {
    return <EmailCell value={value} theme={theme} />;
  }

  if (typeof value === "string" && ISO_DATE_REGEX.test(value)) {
    return <DateCell value={value} />;
  }

  return <DefaultCell value={value} />;
} 