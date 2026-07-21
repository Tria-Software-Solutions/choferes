import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

export const courierHeaderBoxStyles: SxProps<Theme> = {
  mb: 3,
};

export const courierTitleBoxStyles: SxProps<Theme> = {
  mb: 2,
  py: 1,
};

export const courierTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  fontWeight: 800,
  fontSize: "1.75rem",
  letterSpacing: "-0.02em",
  color: (theme) => theme.palette.text.primary,
  mb: 1,
  gap: 1.5,
};

export const courierIconStyles = (theme: Theme): SxProps<Theme> => ({
  mr: 1,
  color: theme.palette.primary.main,
});

export const courierDividerStyles = (theme: Theme): SxProps<Theme> => ({
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
  height: 48,
};

export const addButtonMobileStyles: SxProps<Theme> = {
  display: { xs: "flex", md: "none" },
  minWidth: "auto",
  width: 48,
  height: 48,
  borderRadius: "12px",
  p: 0,
  alignSelf: "center",
};

export const datePickerSx: SxProps<Theme> = (theme) => ({
  height: "48px",
  minWidth: "180px",
  "& .MuiOutlinedInput-root": {
    height: "48px",
    borderRadius: "12px",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
      borderWidth: "1.5px",
      borderRadius: "12px",
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
      outline: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
      outline: "none",
      boxShadow: "none",
      fontSize: "1rem",
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

export const noCouriersBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  paddingTop: "10%",
  paddingBottom: "12%",
};

export const noCouriersIconStyles: CSSProperties = {
  width: "65px",
  height: "65px",
};

export const deleteDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "80vw", sm: 320 },
  maxWidth: { xs: "90vw", sm: 400 },
};

export const addDialogPaperSx: SxProps<Theme> = {
  minWidth: { xs: "90vw", sm: 500, md: 700 },
  maxWidth: { xs: "98vw", sm: 700 },
};
