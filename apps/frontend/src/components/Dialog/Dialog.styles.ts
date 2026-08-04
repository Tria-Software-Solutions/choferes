import { SxProps, Theme } from "@mui/material";

export const dialogPaperStyles = (paperSx: object = {}): SxProps<Theme> => (theme: Theme) => ({
  border: "none",
  borderRadius: "24px",
  minWidth: { xs: "calc(100vw - 32px)", sm: 440 },
  maxWidth: { xs: "calc(100vw - 32px)", sm: 520 },
  boxShadow: theme.palette.mode === "dark"
    ? "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
    : "0 40px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)",
  overflow: "hidden",
  bgcolor: "background.paper",
  position: "relative",
  ...paperSx,
});

export const headerBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background: theme.palette.mode === "dark"
    ? `linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))`
    : `linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.01))`,
  color: theme.palette.text.primary,
  display: "flex",
  alignItems: "flex-start",
  gap: 2.5,
  px: 3.5,
  pt: 3.5,
  pb: 2.5,
});

export const iconBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  borderRadius: "12px",
  width: 44,
  height: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.primary.contrastText,
  flexShrink: 0,
  boxShadow: theme.palette.mode === "dark"
    ? "0 4px 12px rgba(99,102,241,0.3)"
    : "0 4px 12px rgba(99,102,241,0.2)",
});

export const closeButtonStyles: SxProps<Theme> = {
  color: "inherit",
  opacity: 0.5,
  transition: "all 0.2s ease",
  "&:hover": {
    opacity: 1,
    transform: "scale(1.1)",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
};

export const dialogContentStyles: SxProps<Theme> = {
  px: 3,
  pt: 0.5,
  pb: 1.5,
};

export const messageTypographyStyles = (theme: Theme): SxProps<Theme> => ({
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  fontSize: "0.9rem",
  fontWeight: 400,
});

export const customActionsBoxStyles: SxProps<Theme> = {
  px: 3,
  pb: 3,
};

export const dialogActionsStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  gap: 2,
  flexDirection: isSmallScreen ? "column" : "row",
});

export const cancelButtonStyles = (isSmallScreen: boolean): SxProps<Theme> => ({
  minWidth: isSmallScreen ? "100%" : 120,
  px: 3,
  // Geometry (radius, weight, size, min-height) inherited from theme MuiButton
  color: (theme) => theme.palette.text.secondary,
  backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  '&:hover': {
    backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
  '&:active': {
    transform: "translateY(0)",
  },
  '&.Mui-disabled': {
    opacity: 0.6,
    transform: "none",
  },
});

export const confirmButtonStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  minWidth: isSmallScreen ? "100%" : 120,
  px: 3,
  // Geometry (radius, weight, size, min-height) inherited from theme MuiButton
  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: (theme) => theme.palette.primary.contrastText,
  boxShadow: (theme) => theme.palette.mode === "dark"
    ? "0 4px 14px rgba(0,0,0,0.35)"
    : "0 4px 14px rgba(0,0,0,0.12)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  '&:hover': {
    transform: "translateY(-2px)",
    boxShadow: (theme) => theme.palette.mode === "dark"
      ? "0 8px 25px rgba(0,0,0,0.4)"
      : "0 8px 25px rgba(0,0,0,0.15)",
  },
  '&:active': {
    transform: "translateY(0)",
  },
  '&:disabled': {
    background: (theme) => theme.palette.action.disabledBackground,
    color: (theme) => theme.palette.text.disabled,
    boxShadow: "none",
    transform: "none",
    opacity: 0.6,
  },
});
