import { SxProps, Theme } from "@mui/material";

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

export const deleteDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "80vw", sm: 320 },
  maxWidth: { xs: "90vw", sm: 400 },
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
};

// Plain amber icon (no pill / background) that flags employees missing
// pay-related data. The tooltip explains what is missing.
export const incompleteBadgeStyles = (theme: Theme): SxProps<Theme> => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: theme.palette.warning.main,
});
