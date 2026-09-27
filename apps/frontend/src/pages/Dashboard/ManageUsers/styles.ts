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
