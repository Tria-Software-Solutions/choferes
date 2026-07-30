import { SxProps, Theme } from "@mui/material";

export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => (theme: Theme) => ({
  mb: 2.5,
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    minHeight: "54px",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.05)"
      : "rgba(99,102,241,0.04)",
    color: theme.palette.text.primary,
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "50%",
      right: "50%",
      height: "2px",
      borderRadius: "1px",
      backgroundColor: theme.palette.primary.main,
      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: 0,
    },
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.08)"
        : "rgba(99,102,241,0.06)",
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.06)"
        : "#fff",
      boxShadow: theme.palette.mode === "dark"
        ? `0 4px 20px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.1)`
        : `0 4px 20px rgba(99,102,241,0.1), 0 1px 4px rgba(99,102,241,0.06)`,
      "&::after": {
        left: "10%",
        right: "10%",
        opacity: 1,
      },
    },
    "&.Mui-error": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(239,68,68,0.06)"
        : "rgba(239,68,68,0.04)",
      "&::after": {
        backgroundColor: theme.palette.error.main,
      },
    },
    "& fieldset": { border: "none" },
    "& input": {
      color: theme.palette.text.primary,
      fontSize: "0.9rem",
      fontWeight: 500,
      paddingTop: "16px",
      paddingBottom: "16px",
      paddingLeft: "20px",
      paddingRight: "20px",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.45,
        fontWeight: 400,
        fontSize: "0.85rem",
        letterSpacing: "-0.01em",
      },
    },
    "& textarea": {
      color: theme.palette.text.primary,
      fontSize: "0.9rem",
      fontWeight: 500,
      paddingTop: "16px",
      paddingBottom: "16px",
      paddingLeft: "20px",
      paddingRight: "20px",
      lineHeight: "1.6",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.35,
        fontSize: "0.85rem",
      },
    },
    "&.MuiInputBase-multiline .MuiInputBase-input": {
      paddingTop: "16px",
      paddingBottom: "16px",
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "54px",
      paddingRight: "20px",
    },
    "&.MuiInputBase-adornedStart textarea": {
      paddingLeft: "54px",
      paddingRight: "20px",
      paddingTop: "16px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "20px",
      paddingRight: "56px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "54px",
      paddingRight: "56px",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      left: "20px",
      marginRight: 0,
      zIndex: 2,
      top: "50%",
      transform: "translateY(-50%)",
      color: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.2)"
        : "rgba(99,102,241,0.4)",
      "& svg": { fontSize: "18px !important" },
    },
    "&.MuiInputBase-multiline .MuiInputAdornment-positionStart": {
      top: "28px",
      transform: "none",
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "14px",
      marginLeft: 0,
      zIndex: 2,
      pointerEvents: "auto",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: theme.palette.mode === "dark" 
        ? "0 0 0 100px rgba(255,255,255,0.05) inset"
        : "0 0 0 100px rgba(99,102,241,0.04) inset",
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "16px",
      transition: "background-color 5000s ease-in-out 0s",
      caretColor: theme.palette.text.primary,
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: theme.palette.mode === "dark"
        ? "0 0 0 100px rgba(255,255,255,0.06) inset"
        : "0 0 0 100px #fff inset",
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
  "& .MuiFormHelperText-root": {
    margin: 0,
    marginTop: "6px",
    padding: 0,
    fontSize: "0.7rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
  },
  ...customSx,
});

export const inputAdornmentStyles: SxProps<Theme> = {
  position: "absolute",
  left: "14px",
  marginRight: 0,
  zIndex: 2,
};
