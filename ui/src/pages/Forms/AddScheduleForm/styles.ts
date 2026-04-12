import { Theme, SxProps } from "@mui/material/styles";
import { CSSProperties } from "react";

export const boxRoot = {
  width: "100%",
  p: 0,
};

export const gridContainer = {
  mt: 0,
};

export const iconStyle: CSSProperties = {
  color: "#666666",
};

export const textFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  mb: 2.5,
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    minHeight: "52px",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(40,40,50,0.6)"
      : "rgba(255,255,255,0.7)",
    color: theme.palette.text.primary,
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(0,0,0,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(50,50,60,0.7)"
        : "rgba(255,255,255,0.85)",
      borderColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.15)"
        : "rgba(0,0,0,0.12)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(55,55,65,0.8)"
        : "rgba(255,255,255,0.95)",
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
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
      paddingTop: "14px",
      paddingBottom: "14px",
      paddingLeft: "16px",
      paddingRight: "16px",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.6,
      },
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "38px",
      paddingRight: "16px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "16px",
      paddingRight: "48px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "38px",
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
        ? "0 0 0 100px rgba(40,40,50,0.6) inset"
        : "0 0 0 100px rgba(255,255,255,0.7) inset",
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "12px",
      transition: "background-color 5000s ease-in-out 0s",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(55,55,65,0.8) inset"
        : "0 0 0 100px rgba(255,255,255,0.95) inset",
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
});

export const formControl = (theme: Theme) => ({
  "& .MuiOutlinedInput-root, & .MuiSelect-select": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 2,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      outline: "none",
      boxShadow: "none",
    },
  },
});

export const daysSelectBox = (theme: Theme) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 0.5,
});

export const dayChip = (theme: Theme) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.selected,
  px: 1.5,
  py: 0.5,
  borderRadius: 1,
  fontSize: "0.85rem",
});

export const infoBox = (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  p: { xs: 1.5, sm: 2 },
  backgroundColor: theme.palette.action.hover,
  borderRadius: 1,
  border: "1px solid",
  borderColor: theme.palette.divider,
});

export const infoIconBox = (theme: Theme) => ({
  mr: { xs: 1, sm: 2 },
  color: theme.palette.info.main,
});

export const infoTitle = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  mb: 0.5,
  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
});

export const infoDesc = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
});

export const actionsBox = (theme: Theme) => ({
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  justifyContent: "space-between",
  gap: { xs: 1, sm: 2 },
  pt: 2,
  borderTop: "1px solid",
  borderColor: theme.palette.divider,
});

export const clearButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  order: { xs: 3, sm: 1 },
};

export const actionsInnerBox = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 2 },
  width: { xs: "100%", sm: "auto" },
  order: { xs: 1, sm: 2 },
};

export const cancelButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
};

export const submitButton = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  fontWeight: 600,
  px: { xs: 2, sm: 4 },
  py: { xs: 1, sm: 1.5 },
};
