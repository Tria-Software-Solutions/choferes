import { SxProps, Theme } from "@mui/material";

// Shared TextField styles based on login page design
export const formTextFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  mb: 2.5,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    minHeight: "52px",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.04)",
    color: theme.palette.text.primary,
    transition: "background-color 0.15s ease, box-shadow 0.15s ease",
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
        : "0 0 0 3px rgba(0,0,0,0.07)",
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
    // Fix autofill background color
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
