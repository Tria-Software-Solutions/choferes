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
  mb: 2,
  ...customSx,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    transition: "all 0.3s ease",
    "& fieldset": {
      borderColor: theme.palette.divider,
      borderWidth: theme.palette.mode === "dark" ? "1px" : "2px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: theme.palette.mode === "dark" ? 1 : 2,
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
      '::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 1,
      },
    },
  },
});

export const searchIconStyles: CSSProperties = {
  color: "#666666",
};

export const clearIconStyles: CSSProperties = {
  fontSize: "20px",
};
