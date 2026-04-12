import { SxProps, Theme } from "@mui/material";

export const dialogPaperStyles = (paperSx: object = {}): SxProps<Theme> => ({
  border: "none",
  borderRadius: "16px",
  minWidth: 400,
  maxWidth: 500,
  boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  overflow: "hidden",
  bgcolor: "background.paper",
  ...paperSx,
});

export const headerBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background: "transparent",
  color: theme.palette.text.primary,
  display: "flex",
  alignItems: "center",
  gap: 2,
  px: 3,
  py: 2.5,
  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
});

export const iconBoxStyles = (theme: Theme): SxProps<Theme> => ({
  background: theme.palette.primary.main,
  borderRadius: "10px",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.primary.contrastText,
});

export const closeButtonStyles: SxProps<Theme> = {
  color: "inherit",
};

export const dialogContentStyles: SxProps<Theme> = {
  px: 3,
  py: 2,
};

export const messageTypographyStyles = (theme: Theme): SxProps<Theme> => ({
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  fontSize: "0.95rem",
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
  py: 1.5,
  fontWeight: 600,
  borderRadius: "10px",
  border: `1px solid ${isSmallScreen ? "transparent" : "rgba(0,0,0,0.12)"}`,
  color: (theme) => theme.palette.text.secondary,
  backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
  '&:hover': {
    backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
  },
});

export const confirmButtonStyles = (
  isSmallScreen: boolean,
): SxProps<Theme> => ({
  minWidth: isSmallScreen ? "100%" : 120,
  py: 1.5,
  fontWeight: 600,
  borderRadius: "10px",
  backgroundColor: (theme) => theme.palette.primary.main,
  color: (theme) => theme.palette.primary.contrastText,
  border: "none",
  '&:hover': {
    backgroundColor: (theme) => theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: (theme) => theme.palette.action.disabled,
    color: (theme) => theme.palette.text.disabled,
  },
});
