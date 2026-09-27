import { SxProps, Theme } from "@mui/material";

export const permissionNamesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 0.5,
};

export const permissionChipStyles = (theme: Theme): SxProps<Theme> => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  px: 1,
  py: 0.5,
  borderRadius: 1,
  fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
  fontWeight: 500,
});

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

export const noRolesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  height: "100%",
};

export const deleteDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "80vw", sm: 320 },
  maxWidth: { xs: "90vw", sm: 400 },
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
};
