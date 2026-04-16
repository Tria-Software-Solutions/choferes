import { SxProps, Theme } from "@mui/material";

export const textFieldStyles = (customSx: object = {}): SxProps<Theme> => (theme: Theme) => ({
  mb: 1.5,
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    minHeight: "42px",
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
      fontSize: "0.9rem",
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: "14px",
      paddingRight: "14px",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.6,
      },
    },
    "& textarea": {
      color: theme.palette.text.primary,
      fontSize: "0.9rem",
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: "14px",
      paddingRight: "14px",
      lineHeight: "1.5",
      "&::placeholder": {
        color: theme.palette.text.secondary,
        opacity: 0.6,
      },
    },
    "&.MuiInputBase-multiline .MuiInputBase-input": {
      paddingTop: "8px",
      paddingBottom: "10px",
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "36px",
      paddingRight: "14px",
    },
    "&.MuiInputBase-adornedStart textarea": {
      paddingLeft: "36px",
      paddingRight: "14px",
      paddingTop: "12px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingLeft: "14px",
      paddingRight: "44px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "36px",
      paddingRight: "44px",
    },
    "& .MuiInputAdornment-positionStart": {
      position: "absolute",
      left: "12px",
      marginRight: 0,
      zIndex: 2,
      top: "50%",
      transform: "translateY(-50%)",
    },
    "&.MuiInputBase-multiline .MuiInputAdornment-positionStart": {
      top: "23px",
      transform: "none",
      zIndex: 1,
    },
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "8px",
      marginLeft: 0,
      zIndex: 2,
      pointerEvents: "auto",
    },
    // Fix autofill background color
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
  "& .MuiFormHelperText-root": {
    boxShadow: "none !important",
    border: "none !important",
    margin: 0,
    marginTop: "4px",
    padding: 0,
    backgroundColor: "transparent !important",
    backgroundImage: "none !important",
    "&:before": {
      display: "none !important",
    },
    "&:after": {
      display: "none !important",
    },
  },
  "&.Mui-focused .MuiFormHelperText-root": {
    boxShadow: "none !important",
    border: "none !important",
    backgroundColor: "transparent !important",
    backgroundImage: "none !important",
    "&:before": {
      display: "none !important",
    },
    "&:after": {
      display: "none !important",
    },
  },
  "& .Mui-error .MuiFormHelperText-root": {
    boxShadow: "none !important",
    border: "none !important",
    backgroundColor: "transparent !important",
    backgroundImage: "none !important",
    "&:before": {
      display: "none !important",
    },
    "&:after": {
      display: "none !important",
    },
  },
  ...customSx,
});

export const inputAdornmentStyles: SxProps<Theme> = {
  position: "absolute",
  left: "14px",
  marginRight: 0,
  zIndex: 2,
};
