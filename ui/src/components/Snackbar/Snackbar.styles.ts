import { SxProps, Theme } from "@mui/material";

export const snackbarContentStyles = (theme: Theme): SxProps<Theme> => ({
  "& .MuiSnackbarContent-root": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[8],
  },
});

export const closeIconButtonStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export const snackbarButtonStyles = (theme: Theme): React.CSSProperties => ({
  backgroundColor: "transparent",
  border: "none",
  color: theme.palette.primary.contrastText,
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "0.875rem",
  fontWeight: 500,
  transition: "all 0.2s ease",
});
