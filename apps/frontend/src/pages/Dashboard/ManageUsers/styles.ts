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

export const showInactiveBoxStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1,
  cursor: "pointer",
  userSelect: "none",
  color: theme.palette.text.primary,
  transition: "color 0.2s",
  "&:hover": {
    color: theme.palette.primary.main,
    textDecoration: "underline",
  },
  px: 1,
});

export const showInactiveTypographyStyles: SxProps<Theme> = {
  fontSize: "0.95rem",
  whiteSpace: "nowrap",
};

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
