import { SxProps, Theme } from "@mui/material";

export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => (theme: Theme) => ({
  mb: 2.5,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    minHeight: "40px",
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
        : "0 0 0 3px rgba(0,0,0,0.07)",
    },
    "&.Mui-error": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(239,68,68,0.08)"
        : "rgba(239,68,68,0.04)",
      boxShadow: theme.palette.mode === "dark"
        ? "0 0 0 3px rgba(239,68,68,0.16)"
        : "0 0 0 3px rgba(239,68,68,0.1)",
    },
    "& input": {
      color: theme.palette.text.primary,
      fontSize: "0.9375rem",
      fontWeight: 400,
      paddingTop: "11px",
      paddingBottom: "11px",
      paddingLeft: "14px",
      paddingRight: "14px",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.55,
        fontWeight: 400,
        fontSize: "0.9375rem",
      },
    },
    "& textarea": {
      color: theme.palette.text.primary,
      fontSize: "0.9375rem",
      fontWeight: 400,
      paddingTop: "11px",
      paddingBottom: "11px",
      paddingLeft: "14px",
      paddingRight: "14px",
      lineHeight: 1.6,
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.55,
        fontSize: "0.9375rem",
      },
    },
    "&.MuiInputBase-multiline .MuiInputBase-input": {
      paddingTop: "11px",
      paddingBottom: "11px",
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "36px",
      paddingRight: "14px",
    },
    "&.MuiInputBase-adornedStart textarea": {
      paddingLeft: "36px",
      paddingRight: "14px",
      paddingTop: "11px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "14px",
      paddingRight: "40px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "36px",
      paddingRight: "40px",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      left: "12px",
      marginRight: 0,
      zIndex: 2,
      top: "50%",
      transform: "translateY(-50%)",
      color: theme.palette.text.secondary,
      "& svg": { fontSize: "18px !important" },
    },
    "&.MuiInputBase-multiline .MuiInputAdornment-positionStart": {
      top: "22px",
      transform: "none",
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "10px",
      marginLeft: 0,
      zIndex: 2,
      pointerEvents: "auto",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(255,255,255,0.06) inset"
        : "0 0 0 100px rgba(0,0,0,0.04) inset",
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "10px",
      transition: "background-color 5000s ease-in-out 0s",
      caretColor: theme.palette.text.primary,
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(255,255,255,0.09) inset"
        : "0 0 0 100px rgba(0,0,0,0.06) inset",
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
  "& .MuiFormHelperText-root": {
    margin: 0,
    marginTop: "6px",
    padding: 0,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  ...customSx,
});

export const inputAdornmentStyles: SxProps<Theme> = {
  position: "absolute",
  left: "12px",
  marginRight: 0,
  zIndex: 2,
};