import { Theme } from "@mui/material/styles";
import { CSSProperties } from "react";

// ─── Layout ───
export const boxRoot = { width: "100%", p: 0 };
export const gridContainer = { mt: 0 };

// ─── Icons ───
// Field icons inherit the adornment color from the theme (see fieldStyles).
export const iconStyle: CSSProperties = {};

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

// ─── Dropdown menu paper (look comes from the theme's MuiMenu/MuiPopover) ───
export const menuPaperProps = {
  PaperProps: {
    sx: {
      maxHeight: 320,
      overflowY: "auto",
      mt: 0.5,
    },
  },
};

// ─── Section title (splits a long form into labelled groups) ───
export const sectionTitle = (theme: Theme) => ({
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

// ─── Info callout (accent-tinted note inside forms) ───
export const infoBox = (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  gap: { xs: 1.5, sm: 2 },
  p: { xs: 1.5, sm: 1.75 },
  borderRadius: "12px",
  backgroundColor: theme.tokens.colors.accentSoft,
});

export const infoIconBox = (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: "10px",
  backgroundColor: theme.tokens.colors.surface,
  color: theme.tokens.colors.accent,
  flexShrink: 0,
});

export const infoTitle = (theme: Theme) => ({
  fontWeight: 600,
  color: theme.tokens.colors.text,
  mb: 0.25,
  fontSize: "0.8125rem",
});

export const infoDesc = (theme: Theme) => ({
  color: theme.tokens.colors.textMuted,
  fontSize: "0.75rem",
  lineHeight: 1.45,
});

// ─── Standardized form actions ───
// Every form ends with the same footer: an optional "Limpiar" on the left and
// Cancel + the primary action on the right. The primary action is the only
// solid button; secondary actions are quiet text buttons.

export const actionsBox = (theme: Theme) => ({
  display: "flex",
  flexDirection: { xs: "column-reverse", sm: "row" },
  justifyContent: "space-between",
  alignItems: { xs: "stretch", sm: "center" },
  gap: { xs: 1, sm: 2 },
  mt: 3,
  pt: 2,
  borderTop: theme.tokens.borders.hairline,
});

export const actionsInnerBox = {
  display: "flex",
  flexDirection: { xs: "column-reverse", sm: "row" },
  gap: 1,
  width: { xs: "100%", sm: "auto" },
  order: { xs: 1, sm: 2 },
};

const actionBase = {
  px: 2,
  minHeight: 38,
  borderRadius: "10px",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

// Primary action (Agregar / Guardar / Confirmar)
export const submitButton = (theme: Theme) => ({
  ...actionBase,
  backgroundColor: theme.tokens.colors.primary,
  color: theme.tokens.colors.onPrimary,
  boxShadow: `0 1px 2px ${theme.tokens.shadows.button}`,
  "&:hover": { backgroundColor: theme.tokens.colors.primaryHover, color: theme.tokens.colors.onPrimary },
  "&.Mui-disabled": {
    backgroundColor: theme.tokens.colors.disabled,
    color: theme.tokens.colors.disabledText,
    boxShadow: "none",
  },
});

// Secondary action (Cancelar)
export const cancelButton = (theme: Theme) => ({
  ...actionBase,
  color: theme.tokens.colors.textMuted,
  "&:hover": { backgroundColor: theme.tokens.colors.hover, color: theme.tokens.colors.text },
  "&.Mui-disabled": { color: theme.tokens.colors.disabledText },
});

// Clear form action (left side on desktop, last on mobile)
export const clearButton = (theme: Theme) => ({
  ...cancelButton(theme),
  order: { xs: 3, sm: 1 },
});
