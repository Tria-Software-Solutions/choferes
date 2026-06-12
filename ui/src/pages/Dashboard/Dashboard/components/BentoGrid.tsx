import React from "react";
import { Box, Typography, SxProps, Theme, useTheme } from "@mui/material";

interface BentoGridProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, sx }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gridAutoRows: {
          xs: "minmax(280px, auto)",
          sm: "minmax(300px, auto)",
          md: "1fr",
        },
        gap: { xs: 1.5, sm: 2 },
        flex: 1,
        minHeight: 0,
        ...(sx as object),
      }}
    >
      {children}
    </Box>
  );
};

export interface ColSpanConfig {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface BentoGridItemProps {
  title?: string;
  description?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  sx?: SxProps<Theme>;
  colSpan?: ColSpanConfig;
  rowSpan?: ColSpanConfig;
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  title,
  description,
  header,
  icon,
  sx,
  colSpan,
  rowSpan = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hasContent = header || title || description || icon;

  const gridColumn: Record<string, string> = {};
  if (colSpan?.xs && colSpan.xs > 1) gridColumn.xs = `span ${colSpan.xs}`;
  if (colSpan?.sm && colSpan.sm > 1) gridColumn.sm = `span ${colSpan.sm}`;
  if (colSpan?.md && colSpan.md > 1) gridColumn.md = `span ${colSpan.md}`;
  if (colSpan?.lg && colSpan.lg > 1) gridColumn.lg = `span ${colSpan.lg}`;

  const gridRow: Record<string, string> = {};
  if (rowSpan.xs && rowSpan.xs > 1) gridRow.xs = `span ${rowSpan.xs}`;
  if (rowSpan.sm && rowSpan.sm > 1) gridRow.sm = `span ${rowSpan.sm}`;
  if (rowSpan.md && rowSpan.md > 1) gridRow.md = `span ${rowSpan.md}`;
  if (rowSpan.lg && rowSpan.lg > 1) gridRow.lg = `span ${rowSpan.lg}`;

  return (
    <Box
      sx={{
        ...(Object.keys(gridColumn).length > 0 ? { gridColumn } : {}),
        ...(Object.keys(gridRow).length > 0 ? { gridRow } : {}),
        borderRadius: "16px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)"
            : "0 8px 32px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)",
        },
        overflow: "hidden",
        position: "relative",
        ...(sx as object),
      }}
    >
      {!hasContent && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.palette.text.disabled,
            fontSize: "0.8rem",
          }}
        >
          Empty slot
        </Box>
      )}
      {hasContent && (
        <>
          {icon && (
            <Box sx={{ color: theme.palette.primary.main, display: "flex", mb: 1, opacity: 0.7 }}>
              {icon}
            </Box>
          )}
          {title && (
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: theme.palette.text.primary, letterSpacing: "-0.01em", mb: 0.25 }}
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem", lineHeight: 1.4, mb: header ? 1 : 0 }}
            >
              {description}
            </Typography>
          )}
          {header && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              {header}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
