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
      paddingLeft: "36px !important",
    },
    "&.MuiInputBase-adornedStart": {
      "& .MuiSelect-select": {
        paddingTop: "10px !important",
        paddingBottom: "10px !important",
      },
    },
    "& .MuiInputAdornment-positionStart": {
      left: "12px",
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
      borderRadius: "10px",
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

// ─── Standardized Modal Button Styles ───
// Modal actions are plain, minimal TEXT buttons (link-like):
// - submitButton: strong primary text (the main action)
// - cancelButton: subtle secondary text
// - clearButton: like cancel, but ordered first on mobile
// Baseline geometry/weight comes from the theme MuiButton override so every
// button in the app shares the same minimal look & feel.

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

// ─── Base link-button mixin (shared visual traits) ───
const linkButtonBase = {
  px: 1.5,
  minHeight: 36,
  transition: "color 0.15s ease",
  "&:active": {
    transform: "scale(0.97)",
  },
  "&.Mui-disabled": {
    opacity: 0.5,
  },
};

// ─── Primary action (main modal CTA: Agregar / Guardar / Confirmar) ───
export const submitButton = {
  ...linkButtonBase,
  color: "text.primary",
  fontWeight: 600,
  "&:hover": {
    color: "text.primary",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textDecorationThickness: "1px",
  },
};

// ─── Secondary action (Cancelar) ───
export const cancelButton = {
  ...linkButtonBase,
  color: "text.secondary",
  fontWeight: 500,
  "&:hover": {
    color: "text.primary",
  },
};

// ─── Clear form action ───
export const clearButton = {
  ...cancelButton,
  order: { xs: 3, sm: 1 },
};

// ─── Backwards-compatible semantic aliases ───
export const primaryButton = submitButton;
export const secondaryButton = cancelButton;
export const dangerButton = {
  ...submitButton,
  color: "error.main",
  "&:hover": {
    color: "error.main",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    textDecorationThickness: "1px",
  },
};
