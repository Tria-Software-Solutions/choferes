import React from "react";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Call to action, e.g. a "Nuevo …" button. */
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
}

// Consistent "nothing here yet" / "no results" placeholder for lists and tables.
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, sx }) => {
  const { colors, borders } = useTheme().tokens;
  return (
    <Box
      role="status"
      sx={[
        {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 1,
          px: 3,
          py: { xs: 5, md: 6 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {icon && (
        <Box
          aria-hidden
          sx={{
            width: 56,
            height: 56,
            mb: 1,
            borderRadius: "16px",
            display: "grid",
            placeItems: "center",
            color: colors.textMuted,
            backgroundColor: colors.hoverSoft,
            border: borders.paper,
            "& svg": { width: 26, height: 26, strokeWidth: 1.5 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: colors.text }}>{title}</Typography>
      {description && (
        <Typography sx={{ fontSize: "0.875rem", color: colors.textMuted, maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Box>
  );
};

interface LoadingStateProps {
  label?: string;
  sx?: SxProps<Theme>;
}

// Centered spinner for page/section loading.
export const LoadingState: React.FC<LoadingStateProps> = ({ label, sx }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={[
        {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          py: 6,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <CircularProgress size={28} thickness={4} />
      {label && <Typography sx={{ fontSize: "0.85rem", color: colors.textMuted }}>{label}</Typography>}
    </Box>
  );
};
