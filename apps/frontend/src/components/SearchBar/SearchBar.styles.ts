import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

export const searchBarRoot: SxProps<Theme> = (theme) => ({
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  transition: "border-color 0.2s",
  '&:hover': {
    borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
  },
  '&.Mui-focused': {
    borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
  },
  'input::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
  '.MuiInputAdornment-root': {
    color: theme.palette.text.secondary,
  },
});

export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => (theme: Theme) => ({
  mb: 1,
  ...customSx,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    minHeight: "38px",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.04)",
    color: theme.palette.text.primary,
    transition:
      "background-color 0.15s ease, box-shadow 0.15s ease",
    "& fieldset": {
      border: "none",
    },
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.09)"
        : "rgba(0,0,0,0.06)",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.09)"
        : "rgba(0,0,0,0.06)",
      boxShadow: theme.palette.mode === "dark"
        ? "0 0 0 3px rgba(255,255,255,0.1)"
        : "0 0 0 3px rgba(0,0,0,0.05)",
    },
    "& input": {
      color: theme.palette.text.primary,
      fontSize: "0.9375rem",
      fontWeight: 400,
      paddingTop: "9px",
      paddingBottom: "9px",
      paddingLeft: "14px",
      paddingRight: "14px",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.6,
        fontWeight: 400,
      },
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "36px",
      paddingRight: "14px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "14px",
      paddingRight: "38px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "36px",
      paddingRight: "38px",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      left: "12px",
      marginRight: 0,
      zIndex: 2,
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "10px",
      marginLeft: 0,
      zIndex: 2,
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(255,255,255,0.06) inset"
        : "0 0 0 100px rgba(0,0,0,0.04) inset",
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "10px",
      transition: "background-color 5000s ease-in-out 0s",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(255,255,255,0.09) inset"
        : "0 0 0 100px rgba(0,0,0,0.06) inset",
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
});

export const searchIconStyles: CSSProperties = {
  color: "#666666",
};

export const clearIconStyles: CSSProperties = {
  fontSize: "20px",
};
