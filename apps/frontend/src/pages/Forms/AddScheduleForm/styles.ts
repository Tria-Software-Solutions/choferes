import { Theme } from "@mui/material/styles";
import {
  actionsBox as sharedActionsBox,
  actionsInnerBox as sharedActionsInnerBox,
  clearButton as sharedClearButton,
  cancelButton as sharedCancelButton,
  submitButton as sharedSubmitButton,
} from "../sharedStyles";

export const boxRoot = {
  width: "100%",
  p: 0,
};

export const gridContainer = {
  mt: 0,
};

export const iconStyle = (theme: Theme) => ({
  color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
});

export const formControl = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    minHeight: "54px",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.05)"
      : "rgba(99,102,241,0.04)",
    color: theme.palette.text.primary,
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": { border: "none" },
    "& .MuiSelect-select": {
      paddingLeft: "54px !important",
      paddingTop: "16px !important",
      paddingBottom: "16px !important",
      color: theme.palette.text.primary,
      fontSize: "0.9rem",
      fontWeight: 500,
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
    "& .MuiInputAdornment-positionEnd": {
      position: "absolute",
      right: "14px",
      marginLeft: 0,
      zIndex: 2,
      pointerEvents: "auto",
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
        ? "0 4px 20px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.1)"
        : "0 4px 20px rgba(99,102,241,0.1), 0 1px 4px rgba(99,102,241,0.06)",
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
  gap: { xs: 1.5, sm: 2.5 },
  p: { xs: 1.5, sm: 2 },
  borderRadius: "16px",
  backgroundColor: theme.palette.mode === "dark"
    ? "rgba(99,102,241,0.04)"
    : "rgba(99,102,241,0.03)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "15%",
    bottom: "15%",
    width: 3,
    borderRadius: "0 3px 3px 0",
    backgroundColor: theme.palette.primary.main,
    opacity: 0.4,
  },
});

export const infoIconBox = (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: "10px",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: "#fff",
  flexShrink: 0,
  boxShadow: theme.palette.mode === "dark"
    ? "0 4px 12px rgba(99,102,241,0.25)"
    : "0 4px 12px rgba(99,102,241,0.15)",
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

// ─── Re-export shared premium button styles ───
export const actionsBox = sharedActionsBox;
export const actionsInnerBox = sharedActionsInnerBox;
export const clearButton = sharedClearButton;
export const cancelButton = sharedCancelButton;
export const submitButton = sharedSubmitButton;

export const textFieldSx = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    "& .MuiInputAdornment-positionStart": {
      left: "20px",
    },
    "& .MuiInputAdornment-positionEnd": {
      right: "14px",
    },
    "& input": {
      paddingTop: "16px",
      paddingBottom: "16px",
      paddingLeft: "20px",
      paddingRight: "20px",
    },
    "&.MuiInputBase-adornedStart input": {
      paddingLeft: "54px",
    },
    "&.MuiInputBase-adornedEnd input": {
      paddingRight: "56px",
    },
    "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
      paddingLeft: "54px",
      paddingRight: "56px",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 100px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.04)"} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
      borderRadius: "16px",
      transition: "background-color 5000s ease-in-out 0s",
    },
  },
});
