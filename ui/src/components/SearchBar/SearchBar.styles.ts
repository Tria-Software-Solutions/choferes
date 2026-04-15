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
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused': {
    borderColor: theme.palette.primary.main,
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
    borderRadius: "16px",
    minHeight: "48px",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.03)"
      : "rgba(0,0,0,0.02)",
    color: theme.palette.text.primary,
    border: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transform: "translateY(-1px)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.06)",
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}15, 0 8px 24px rgba(0,0,0,0.12)`,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "& fieldset": {
      border: "none",
    },
    "& input": {
      color: theme.palette.text.primary,
      fontSize: "0.95rem",
      fontWeight: 400,
      paddingTop: "12px",
      paddingBottom: "12px",
      paddingLeft: "16px",
      paddingRight: "16px",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.5,
        fontWeight: 400,
      },
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "44px",
      paddingRight: "16px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "16px",
      paddingRight: "48px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "44px",
      paddingRight: "48px",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      left: "14px",
      marginRight: 0,
      zIndex: 2,
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "14px",
      marginLeft: 0,
      zIndex: 2,
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(255,255,255,0.03) inset"
        : "0 0 0 100px rgba(0,0,0,0.02) inset",
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "16px",
      transition: "background-color 5000s ease-in-out 0s",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(255,255,255,0.08) inset"
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
