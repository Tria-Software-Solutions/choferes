import { SxProps, Theme } from "@mui/material";

// Paper: radius, border and shadow come from the theme (MuiDialog); only the
// width bounds are set here.
export const dialogPaperStyles = (paperSx: object = {}): SxProps<Theme> => ({
  minWidth: { xs: "calc(100vw - 32px)", sm: 440 },
  maxWidth: { xs: "calc(100vw - 32px)", sm: 560 },
  position: "relative",
  ...paperSx,
});

export const headerBoxStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 1.5,
  px: 3,
  pt: 2.5,
  pb: 1.5,
  color: theme.tokens.colors.text,
});

// Tinted icon tile next to the dialog title. Icons passed with their own
// colors are normalised to the accent so every dialog looks the same.
export const headerIconStyles = (theme: Theme): SxProps<Theme> => ({
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: "10px",
  display: "grid",
  placeItems: "center",
  color: theme.tokens.colors.accent,
  backgroundColor: theme.tokens.colors.accentSoft,
  "& svg": { width: 18, height: 18, color: theme.tokens.colors.accent, stroke: "currentColor" },
});

// Dark tile kept for dialogs that build their own header (forms, OCR).
export const iconBoxStyles = (theme: Theme): SxProps<Theme> => ({
  width: 40,
  height: 40,
  borderRadius: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: theme.tokens.colors.accent,
  backgroundColor: theme.tokens.colors.accentSoft,
});

export const closeButtonStyles: SxProps<Theme> = {
  color: "inherit",
};

export const dialogContentStyles: SxProps<Theme> = {
  px: 3,
  pt: 0.5,
  pb: 2.5,
};

export const messageTypographyStyles = (theme: Theme): SxProps<Theme> => ({
  lineHeight: 1.6,
  color: theme.tokens.colors.textMuted,
  fontSize: "0.9rem",
});

export const customActionsBoxStyles: SxProps<Theme> = {
  px: 3,
  pb: 3,
};
