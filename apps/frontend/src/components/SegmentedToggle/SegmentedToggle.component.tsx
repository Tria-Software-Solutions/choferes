import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "small" | "medium";
  fullWidth?: boolean;
}

// SegmentedToggle renders a pill-style segmented control (e.g. Semanal / Quincenal / Mensual)
// with a neutral theme-based active state, used consistently across all pages.
export default function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "small",
  fullWidth = false,
}: SegmentedToggleProps<T>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const containerSx = {
    display: "flex",
    gap: 0.3,
    justifyContent: "center",
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    borderRadius: "10px",
    p: 0.35,
    width: fullWidth ? "100%" : "fit-content",
    maxWidth: "100%",
    overflowX: "auto",
  };

  const itemSx = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    flex: fullWidth ? 1 : "none",
    px: size === "medium" ? { xs: 1, sm: 2 } : 0.9,
    py: size === "medium" ? { xs: "5px", sm: "6px" } : 0.5,
    borderRadius: "8px",
    cursor: "pointer",
    userSelect: "none",
    justifyContent: "center",
    fontSize: size === "medium" ? { xs: "0.7rem", sm: "0.8rem" } : "0.7rem",
    fontWeight: active ? 700 : 500,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    backgroundColor: active
      ? isDark
        ? "rgba(255,255,255,0.14)"
        : "rgba(0,0,0,0.08)"
      : "transparent",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
    ...(active
      ? {}
      : {
          "&:hover": {
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          },
        }),
  });

  return (
    <Box sx={containerSx}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={itemSx(active)}
          >
            {opt.icon}
            <Typography
              sx={{
                fontSize: "inherit",
                fontWeight: "inherit",
                color: "inherit",
                lineHeight: 1.2,
              }}
            >
              {opt.label}
            </Typography>
            {opt.count !== undefined && (
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 20,
                  height: 18,
                  px: 0.6,
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  backgroundColor: active
                    ? isDark
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.12)"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  color: active
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                {opt.count}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
