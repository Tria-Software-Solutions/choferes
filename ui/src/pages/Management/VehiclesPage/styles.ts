import { SxProps, Theme } from "@mui/material";

export const vehiclesHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
};

export const vehiclesTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
};

export const vehiclesTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontFamily: "'Urbanist', sans-serif",
  fontWeight: 800,
  color: "#000000",
  mb: 0.5,
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

export const datePickerSx: SxProps<Theme> = {
  height: "56px",
  minWidth: "180px",
  "& .MuiOutlinedInput-root": {
    height: "56px",
    borderRadius: 2,
    backgroundColor: "#ffffff",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
      borderWidth: 2,
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      outline: "none",
      boxShadow: "none",
    },
    "& input": {
      outline: "none",
      boxShadow: "none",
    },
  },
};

export const buttonGroupSx: SxProps<Theme> = {
  height: "56px",
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
  },
};

export const noVehiclesBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "10%",
  paddingBottom: "12%",
};

export const noVehiclesIconStyles: SxProps<Theme> = {
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
