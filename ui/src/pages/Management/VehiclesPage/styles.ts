import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

export const vehiclesHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
};

export const vehiclesTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
  py: 1,
};

export const vehiclesTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontWeight: 800,
  fontSize: "1.75rem",
  letterSpacing: "-0.02em",
  color: (theme) => theme.palette.text.primary,
  mb: 1,
  gap: 1.5,
};

export const vehiclesIconStyles = (theme: Theme): SxProps<Theme> => ({
  mr: 1,
  color: theme.palette.primary.main,
});

export const vehiclesDividerStyles = (theme: Theme): SxProps<Theme> => ({
  width: 48,
  borderBottomWidth: 3,
  borderColor: theme.palette.primary.main,
  borderRadius: "2px",
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
  minHeight: 48,
};

export const datePickerSx: SxProps<Theme> = (theme) => ({
  height: "48px",
  minWidth: "180px",
  "& .MuiOutlinedInput-root": {
    height: "48px",
    borderRadius: "12px",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      outline: "none",
      boxShadow: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
      outline: "none",
      boxShadow: "none",
    },
  },
});

export const buttonGroupSx: SxProps<Theme> = (theme) => ({
  height: "48px",
  width: "auto",
  flexDirection: "row",
  "& .MuiButton-root": {
    minWidth: 0,
    height: "100%",
    px: 2,
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&.Mui-disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.text.disabled,
      border: "none",
    },
  },
});

export const noVehiclesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  height: "100%",
};

export const noVehiclesIconStyles: CSSProperties = {
  width: "65px",
  height: "65px",
};

export const deleteDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "80vw", sm: 320 },
  maxWidth: { xs: "90vw", sm: 400 },
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 450, md: 600 },
  maxWidth: { xs: "98vw", sm: 600 },
};
