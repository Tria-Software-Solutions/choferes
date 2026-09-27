import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface PanelHeaderProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned controls. */
  actions?: React.ReactNode;
  /** Hairline under the header (default true). */
  divider?: boolean;
  sx?: SxProps<Theme>;
}

// Header of a panel/section inside a page (Configuración tabs, expediente
// cards): same accent icon tile and type scale as the page header, one step
// smaller.
export const PanelHeader: React.FC<PanelHeaderProps> = ({
  icon,
  title,
  description,
  actions,
  divider = true,
  sx,
}) => {
  const { colors, borders } = useTheme().tokens;
  return (
    <Box
      sx={[
        {
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          pb: 2,
          mb: 2.5,
          ...(divider && { borderBottom: borders.hairline }),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {icon && (
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: "10px",
            display: "grid",
            placeItems: "center",
            color: colors.accent,
            backgroundColor: colors.accentSoft,
            "& svg": { width: 18, height: 18, strokeWidth: 1.85 },
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="h2"
          sx={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.3, color: colors.text }}
        >
          {title}
        </Typography>
        {description && (
          <Typography component="div" sx={{ mt: 0.25, fontSize: "0.8125rem", color: colors.textMuted, lineHeight: 1.45 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>{actions}</Box>}
    </Box>
  );
};
