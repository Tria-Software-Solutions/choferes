import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type StatTone = "default" | "accent" | "success" | "warning" | "danger" | "info";

// Foreground / tinted background for each tone, from the theme tokens.
export const useToneColors = () => {
  const { colors } = useTheme().tokens;
  return (tone: StatTone) =>
    ({
      default: { fg: colors.textMuted, bg: colors.hover },
      accent: { fg: colors.accent, bg: colors.accentSoft },
      success: { fg: colors.success, bg: colors.successSoft },
      warning: { fg: colors.warning, bg: colors.warningSoft },
      danger: { fg: colors.error, bg: colors.errorSoft },
      info: { fg: colors.info, bg: colors.infoSoft },
    })[tone];
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** Secondary line under the value (trend, unit, context). */
  hint?: React.ReactNode;
  /** Extra content under the hint (e.g. a progress meter). */
  footer?: React.ReactNode;
  /** Makes the whole card a button (e.g. to jump to the detail of the metric). */
  onClick?: () => void;
  tone?: StatTone;
  sx?: SxProps<Theme>;
}

// KPI tile used across the app (Empleados, Reportes, expediente): label, big
// value and a small tinted icon. Tones only color the icon, never the card, so
// a row of stats stays calm and readable.
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  hint,
  footer,
  onClick,
  tone = "default",
  sx,
}) => {
  const { colors, borders } = useTheme().tokens;
  const toneColors = useToneColors()(tone);
  return (
    <Box
      {...(onClick && {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        },
      })}
      sx={[
        {
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          p: { xs: 1.5, sm: 1.75 },
          borderRadius: "12px",
          border: borders.paper,
          backgroundColor: colors.surface,
        },
        onClick && {
          cursor: "pointer",
          transition: "border-color 160ms ease, background-color 160ms ease",
          "&:hover": { borderColor: colors.borderStrong, backgroundColor: colors.hoverSoft },
          "&:focus-visible": { outline: `2px solid ${colors.accent}`, outlineOffset: 2 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography
          component="span"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: colors.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
        {icon && (
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              color: toneColors.fg,
              backgroundColor: toneColors.bg,
              "& svg": { width: 15, height: 15, strokeWidth: 2 },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: { xs: "1.25rem", sm: "1.375rem" },
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          color: tone === "default" || tone === "accent" ? colors.text : toneColors.fg,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
      {hint && (
        <Typography component="span" sx={{ fontSize: "0.75rem", color: colors.textMuted }}>
          {hint}
        </Typography>
      )}
      {footer && <Box sx={{ mt: 0.5 }}>{footer}</Box>}
    </Box>
  );
};

interface StatGridProps {
  children: React.ReactNode;
  /** Columns on desktop (defaults to the number of children, max 5). */
  columns?: number;
  sx?: SxProps<Theme>;
}

// Responsive row of StatCards: 2 columns on phones, 3 on tablets, N on desktop.
export const StatGrid: React.FC<StatGridProps> = ({ children, columns, sx }) => {
  const count = columns ?? Math.min(React.Children.count(children), 5);
  return (
    <Box
      sx={[
        {
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: `repeat(${Math.min(count, 3)}, minmax(0, 1fr))`,
            md: `repeat(${count}, minmax(0, 1fr))`,
          },
          gap: { xs: 1, sm: 1.25 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
};
