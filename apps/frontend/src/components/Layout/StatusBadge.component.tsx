import React from "react";
import { Box, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { StatTone, useToneColors } from "./StatCard.component";

interface StatusBadgeProps {
  label: React.ReactNode;
  tone?: StatTone;
  /** Leading icon instead of the status dot. */
  icon?: React.ReactNode;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
}

// Pill used for every status in the app (activo/inactivo, vigente/vencida,
// pendiente/enviado…): tinted background, colored dot and label.
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = "default",
  icon,
  size = "medium",
  sx,
}) => {
  const { colors } = useTheme().tokens;
  const toneColors = useToneColors()(tone);
  return (
    <Box
      component="span"
      sx={[
        {
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          height: size === "small" ? 22 : 24,
          px: size === "small" ? 0.9 : 1,
          borderRadius: "999px",
          fontSize: size === "small" ? "0.6875rem" : "0.75rem",
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: tone === "default" ? colors.textMuted : toneColors.fg,
          backgroundColor: toneColors.bg,
          "& svg": { width: 12, height: 12, strokeWidth: 2.25 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {icon ?? (
        <Box
          component="span"
          aria-hidden
          sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "currentColor", flexShrink: 0 }}
        />
      )}
      {label}
    </Box>
  );
};
