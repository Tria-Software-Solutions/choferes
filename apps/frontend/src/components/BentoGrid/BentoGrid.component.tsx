import React from "react";
import { Box, Typography, SxProps, Theme, useTheme } from "@mui/material";

interface BentoGridProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

// Responsive card grid used by the dashboards (Reportes, Mi Panel). Cards fill
// the available space on tall screens but never shrink below a readable size:
// on short screens the body scrolls instead of clipping charts and legends.
export const BentoGrid: React.FC<BentoGridProps> = ({ children, sx }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gridAutoRows: {
          xs: "auto",
          sm: "minmax(240px, auto)",
          md: "minmax(230px, 1fr)",
        },
        gap: { xs: 1, md: 1.25 },
        flex: { xs: "0 0 auto", md: 1 },
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
  /** Controls rendered at the right of the title (e.g. "Solicitar"). */
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
  colSpan?: ColSpanConfig;
  rowSpan?: ColSpanConfig;
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  title,
  description,
  header,
  icon,
  actions,
  sx,
  colSpan,
  rowSpan = {},
}) => {
  const theme = useTheme();
  const { borders, shadows } = theme.tokens;
  const hasContent = header || title || description || icon || actions;

  const gridColumn: Record<string, string> = {};
  if (colSpan) {
    if (colSpan.xs && colSpan.xs > 1) gridColumn.xs = `span ${colSpan.xs}`;
    if (colSpan.sm && colSpan.sm > 1) gridColumn.sm = `span ${colSpan.sm}`;
    if (colSpan.md && colSpan.md > 1) gridColumn.md = `span ${colSpan.md}`;
    if (colSpan.lg && colSpan.lg > 1) gridColumn.lg = `span ${colSpan.lg}`;
  }

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
        borderRadius: "14px",
        border: borders.paper,
        boxShadow: `0 1px 2px ${shadows.card}`,
        p: { xs: 2, md: 2.25 },
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        backgroundColor: theme.palette.background.paper,
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
          {(icon || title) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                {icon && (
                  <Box
                    sx={{
                      color: theme.tokens.colors.accentStrong,
                      backgroundColor: theme.tokens.colors.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      flexShrink: 0,
                      "& svg": { width: 18, height: 18 },
                    }}
                  >
                    {icon}
                  </Box>
                )}
                {title && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      letterSpacing: "-0.01em",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {title}
                  </Typography>
                )}
              </Box>
              {actions && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                  {actions}
                </Box>
              )}
            </Box>
          )}
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                lineHeight: 1.3,
                mt: icon || title ? 0.5 : 0,
                mb: header ? 1.5 : 0,
              }}
            >
              {description}
            </Typography>
          )}
          {header && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                mt: { xs: 0.5, sm: 0 },
              }}
            >
              {header}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
