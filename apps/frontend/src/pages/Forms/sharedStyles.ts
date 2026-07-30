import { Theme } from "@mui/material/styles";
import { CSSProperties } from "react";

// ─── Layout ───
export const boxRoot = { width: "100%", p: 0 };
export const gridContainer = { mt: 0 };

// ─── Icons ───
export const iconStyle: CSSProperties = {
  color: "#666666",
};

// ─── Input field overrides for forms with icon adornments ───
// NOTE: Base input styles are handled by TextfieldComponent.
// These overrides only adjust icon/padding positions for specific form layouts.
export const textFieldSx = (theme: Theme) => ({});

// ─── Form Select (MUI Select with icon) ───
export const formControl = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    "& .MuiSelect-select": {
      paddingLeft: "54px !important",
    },
    "&.MuiInputBase-adornedStart": {
      "& .MuiSelect-select": {
        paddingTop: "16px !important",
        paddingBottom: "16px !important",
      },
    },
    "& .MuiInputAdornment-positionStart": {
      left: "20px",
    },
  },
});

// ─── Dropdown menu paper ───
export const menuPaperProps = {
  PaperProps: {
    sx: (theme: Theme) => ({
      maxHeight: 320,
      overflowY: "auto",
      mt: 0.5,
      borderRadius: "16px",
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(30,30,35,0.95)'
        : '#ffffff',
      boxShadow: theme.palette.mode === 'dark'
        ? "0 10px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)"
        : "0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
      border: "none",
      overflow: 'hidden',
      pr: 0.5,
      color: theme.palette.text.primary,
    }),
  },
};

// ─── Info box premium ───
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
  mb: 0.25,
  fontSize: "0.8rem",
});

export const infoDesc = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.7rem",
  lineHeight: 1.45,
  opacity: 0.8,
});

// ─── Standardized Premium Button Styles ───
// These are the canonical button styles for all modals across the app.
// - primaryButton: gradient filled (submit, save, confirm, generate, import)
// - secondaryButton: subtle background (cancel, close, clear)
// - dangerButton: red filled (delete, subtract)

// ─── Layout helpers ───
export const actionsBox = (theme: Theme) => ({
  display: "flex",
  flexDirection: { xs: "column-reverse", sm: "row" },
  justifyContent: "space-between",
  alignItems: "center",
  gap: { xs: 1.5, sm: 2 },
  pt: 3,
});

export const actionsInnerBox = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 1.5 },
  width: { xs: "100%", sm: "auto" },
  order: { xs: 1, sm: 2 },
};

// ─── Base button mixin (shared visual traits) ───
const buttonBase = {
  fontWeight: 600,
  fontSize: "0.85rem",
  textTransform: "none" as const,
  letterSpacing: "-0.01em",
  borderRadius: "12px",
  minHeight: "48px",
  px: 3,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&.Mui-disabled": {
    boxShadow: "none",
    transform: "none",
    opacity: 0.6,
  },
};

// ─── Primary (gradient filled) ───
export const primaryButton = {
  ...buttonBase,
  fontSize: "0.9rem",
  boxShadow: "0 4px 14px rgba(99,102,241,0.25)",
  "&:hover": {
    ...buttonBase["&:hover"],
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(99,102,241,0.35)",
  },
  "&:active": {
    ...buttonBase["&:active"],
    boxShadow: "0 2px 8px rgba(99,102,241,0.2)",
  },
  "&.Mui-disabled": buttonBase["&.Mui-disabled"],
};

// ─── Secondary (subtle background) ───
export const secondaryButton = {
  ...buttonBase,
  "&:hover": {
    ...buttonBase["&:hover"],
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
  "&:active": buttonBase["&:active"],
  "&.Mui-disabled": buttonBase["&.Mui-disabled"],
};

// ─── Danger (red filled) ───
export const dangerButton = {
  ...buttonBase,
  fontSize: "0.9rem",
  boxShadow: "0 4px 14px rgba(239,68,68,0.25)",
  "&:hover": {
    ...buttonBase["&:hover"],
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(239,68,68,0.35)",
  },
  "&:active": {
    ...buttonBase["&:active"],
    boxShadow: "0 2px 8px rgba(239,68,68,0.2)",
  },
  "&.Mui-disabled": buttonBase["&.Mui-disabled"],
};

// ─── Aliases for backward compatibility ───
export const submitButton = primaryButton;
export const cancelButton = secondaryButton;
export const clearButton = {
  ...secondaryButton,
  order: { xs: 3, sm: 1 },
};
