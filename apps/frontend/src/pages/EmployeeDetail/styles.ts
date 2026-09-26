import { SxProps, Theme } from "@mui/material";

// Soft surfaces/borders that stay legible in both light and dark mode.
const softBorder = (theme: Theme) =>
  theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

const hairline = (theme: Theme) =>
  theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

const hoverTint = (theme: Theme) =>
  theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

// Ultra-subtle overlay scrollbar: 6px wide, near-invisible thumb that only
// gains a bit of contrast while hovering the scroll area.
const subtleScrollbar = (theme: Theme) => {
  const thumb =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const thumbHover =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.20)";

  return {
    scrollbarWidth: "thin" as const,
    scrollbarColor: `${thumb} transparent`,
    "&::-webkit-scrollbar": {
      width: 6,
      height: 6,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: thumb,
      borderRadius: 3,
      "&:hover": { backgroundColor: thumbHover },
    },
    "&::-webkit-scrollbar-corner": {
      backgroundColor: "transparent",
    },
  };
};

export const detailBoxStyles: SxProps<Theme> = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
  px: { xs: 1, sm: 1.5, md: 2 },
  pt: 0,
  pb: 0,
};

// Main surface — same premium treatment as the employees table card.
export const premiumCardStyles = (theme: Theme): SxProps<Theme> => ({
  borderRadius: "16px",
  border: `1px solid ${softBorder(theme)}`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 24px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.3)"
      : "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  overflow: "hidden",
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  // The theme adds a 24px bottom margin to every Paper; the page handles its
  // own spacing so the card fills the available height instead.
  mb: 3,
});

export const centeredCardContentStyles: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  px: 3,
  py: 8,
  textAlign: "center",
};

export const detailHeaderStyles = (theme: Theme): SxProps<Theme> => ({
  px: { xs: 2, sm: 2.5 },
  pt: { xs: 1.5, sm: 1.5 },
  pb: 0,
  flexShrink: 0,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${hairline(theme)}`,
});

// Standard theme button (radius, height, typography all come from the theme);
// only the ghost look and alignment are customised here.
export const backButtonStyles = (theme: Theme): SxProps<Theme> => ({
  alignSelf: "flex-start",
  ml: -1.5,
  color: theme.palette.text.secondary,
  boxShadow: "none",
  "&:hover": {
    color: theme.palette.text.primary,
    backgroundColor: hoverTint(theme),
    boxShadow: "none",
  },
});

export const identityBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: { xs: 1.75, sm: 2.25 },
  mt: { xs: 0.5, sm: 0.75 },
  minWidth: 0,
};

// Gradient ring around the avatar (premium touch, replaces the flat border).
export const avatarRingStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: "3px",
  borderRadius: "50%",
  flexShrink: 0,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 16px rgba(0,0,0,0.4)"
      : "0 4px 16px rgba(0,0,0,0.12)",
});

export const nameStyles: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: "1.15rem", sm: "1.35rem" },
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  color: "text.primary",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const emailStyles: SxProps<Theme> = {
  fontSize: "0.8rem",
  letterSpacing: "0.01em",
  color: "text.secondary",
  mt: 0.25,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const metaChipsRowStyles: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 0.75,
  mt: 1,
};

// Small metric pills (hourly rate, vacation balance, hire date).
export const metaChipStyles = (theme: Theme): SxProps<Theme> => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.6,
  px: 1.1,
  py: 0.4,
  borderRadius: "999px",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.01em",
  color: theme.palette.text.secondary,
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)",
  border: `1px solid ${hairline(theme)}`,
  whiteSpace: "nowrap",
});

// Matches the tab bar used elsewhere in the app (44px tall, 3px indicator).
export const tabsBoxStyles: SxProps<Theme> = {
  mt: 1.5,
  minHeight: 44,
  "& .MuiTabs-root": { minHeight: 44 },
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.85rem",
    letterSpacing: "-0.01em",
    minHeight: 44,
    px: { xs: 1.5, sm: 2 },
  },
  "& .MuiTabs-indicator": {
    height: 3,
    borderRadius: "3px 3px 0 0",
  },
};

export const contentBoxStyles = (theme: Theme): SxProps<Theme> => ({
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  px: { xs: 2, sm: 2.5 },
  pt: { xs: 2, sm: 2.5 },
  pb: 0,
  ...subtleScrollbar(theme),
});

// Vertical stack of the cards inside a tab. Spacing is handled by the theme's
// Paper margin (mb: 3 set on sectionPaperStyles), like in the rest of the app.
export const cardStackStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

// Inner cards follow the app-standard surface: same radius, border and soft
// shadow language as the other pages, with the detail padding on top.
export const sectionPaperStyles = (theme: Theme): SxProps<Theme> => ({
  p: { xs: 2, sm: 2.5 },
  borderRadius: "12px",
  border: `1px solid ${softBorder(theme)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 1px 2px rgba(0,0,0,0.35)"
      : "0 1px 2px rgba(0,0,0,0.03)",
  mb: 3,
});

export const sectionTitleStyles: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: "1rem",
  letterSpacing: "-0.01em",
  color: "text.primary",
  mb: 2,
};

export const emptyStateBoxStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1.5,
  py: 6,
  px: 2,
  borderRadius: "12px",
  color: "text.secondary",
  border: `1px dashed ${softBorder(theme)}`,
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
});

// Bounded height so the table header can stay sticky while the rows scroll.
// Scrollbar is kept ultra subtle so the tables don't feel boxed in.
export const tableContainerStyles = (theme: Theme): SxProps<Theme> => ({
  maxHeight: { xs: 340, sm: 440 },
  ...subtleScrollbar(theme),
});

// Opaque background is required by MUI's stickyHeader so rows don't show
// through while scrolling.
export const tableHeaderCellStyles: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.secondary",
  backgroundColor: "background.paper",
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 1.25,
  whiteSpace: "nowrap",
};

export const tableCellStyles: SxProps<Theme> = {
  fontSize: "0.875rem",
  color: "text.primary",
  py: 1.35,
  borderBottom: "1px solid",
  borderColor: "divider",
  verticalAlign: "middle",
};
