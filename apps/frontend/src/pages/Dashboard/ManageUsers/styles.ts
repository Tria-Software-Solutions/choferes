import { SxProps, Theme } from "@mui/material";

export const errorBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "10%",
  gap: 2,
};

export const errorAlertStyles: SxProps<Theme> = {
  maxWidth: 600,
};

export const retryButtonStyles: SxProps<Theme> = {
  mt: 2,
};

export const loadingBoxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "10%",
};

export const backdropStyles = (theme: Theme): SxProps<Theme> => ({
  color: "#fff",
  zIndex: theme.zIndex.drawer + 1,
});

export const searchBarBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const addButtonMobileStyles: SxProps<Theme> = {
  display: { xs: "flex", md: "none" },
  minWidth: "auto",
  width: 56,
  height: 56,
  borderRadius: "50%",
  p: 0,
  mt: -1,
};

export const addButtonDesktopBoxStyles: SxProps<Theme> = {
  display: { xs: "none", md: "flex" },
};

export const addButtonDesktopStyles: SxProps<Theme> = {
  px: 3,
  py: 1.5,
  fontSize: "1rem",
  minHeight: 56,
};

export const statusFilterBoxStyles: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  padding: 0.5,
  borderRadius: "12px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.04)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.06)"
  }`,
});

export const statusFilterOptionStyles = (
  theme: Theme,
  selected: boolean,
): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  px: 1.5,
  py: 0.6,
  borderRadius: "9px",
  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
  fontSize: "0.8rem",
  fontWeight: selected ? 700 : 500,
  color: selected ? theme.palette.text.primary : theme.palette.text.secondary,
  backgroundColor: selected
    ? theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.12)"
      : "rgba(255,255,255,0.95)"
    : "transparent",
  boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
  transition: "all 0.2s ease",
  "&:hover": {
    color: theme.palette.text.primary,
    backgroundColor: selected
      ? theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.12)"
        : "rgba(255,255,255,0.95)"
      : theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.03)",
  },
});

export const statusFilterCountStyles = (
  theme: Theme,
  selected: boolean,
): SxProps<Theme> => ({
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
  backgroundColor: selected
    ? theme.palette.primary.main
    : theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.06)",
  color: selected
    ? theme.palette.primary.contrastText
    : theme.palette.text.secondary,
});

export const noUsersBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  height: "100%",
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
};

export const passwordDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
};
