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

export const searchBarSx: SxProps<Theme> = {
  maxWidth: "100%",
};

export const permissionBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  p: 1.2,
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
  cursor: "default",
  minHeight: 36,
};

export const permissionIconBoxStyles: SxProps<Theme> = {
  mr: 1,
  color: "primary.main",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
};

export const permissionIconStyles: SxProps<Theme> = {
  color: "primary.main",
  fontSize: 22,
};

export const noPermissionsBoxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
}; 