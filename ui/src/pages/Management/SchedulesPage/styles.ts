import { SxProps, Theme } from "@mui/material";

export const schedulesHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
};

export const schedulesTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
  py: { xs: 2, sm: 3, md: 4 },
};

export const schedulesTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontFamily: "'Urbanist', sans-serif",
  fontWeight: 800,
  color: (theme) => theme.palette.text.primary,
  mb: 0.5,
  gap: 1.5,
};

export const schedulesIconStyles = (theme: Theme): SxProps<Theme> => ({
  mr: 1,
  color: theme.palette.primary.main,
});

export const schedulesDividerStyles = (theme: Theme): SxProps<Theme> => ({
  width: 48,
  borderBottomWidth: 3,
  borderColor: theme.palette.primary.main,
  borderRadius: 2,
  mx: "auto",
  mb: 0.5,
});

export const exportSpeedDialBoxStyles: SxProps<Theme> = {
  minHeight: 65,
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
  justifyContent: "center",
  gap: 2,
  height: 56,
};

export const addButtonMobileStyles: SxProps<Theme> = {
  display: { xs: "flex", md: "none" },
  minWidth: "auto",
  width: 56,
  height: 56,
  borderRadius: "50%",
  p: 0,
  alignSelf: "center",
  mt: -1,
};

export const addButtonDesktopBoxStyles: SxProps<Theme> = {
  display: { xs: "none", md: "flex" },
  justifyContent: "flex-end",
};

export const addButtonDesktopStyles: SxProps<Theme> = {
  px: 3,
  py: 1.5,
  fontSize: "1rem",
  minHeight: 56,
};

export const noSchedulesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "10%",
  paddingBottom: "12%",
};

export const noSchedulesIconStyles: SxProps<Theme> = {
  fontSize: "65px",
};

export const deleteDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "80vw", sm: 320 },
  maxWidth: { xs: "90vw", sm: 400 },
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
};
