import { SxProps, Theme } from "@mui/material";

// Surfaces, borders and shadows come from the theme tokens (theme/tokens.ts),
// the same ones every page uses.
const softBorder = (theme: Theme) => theme.tokens.colors.border;

export const hairline = (theme: Theme) => theme.tokens.colors.borderHairline;

export const panelShadow = (theme: Theme) => `0 1px 2px ${theme.tokens.shadows.card}`;

const hoverTint = (theme: Theme) => theme.tokens.colors.hover;

export const detailHeaderStyles = (theme: Theme): SxProps<Theme> => ({
  px: { xs: 2.5, sm: 3 },
  pt: { xs: 2, sm: 2.5 },
  pb: 0,
  flexShrink: 0,
  position: "relative",
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
  color: theme.tokens.colors.textMuted,
  backgroundColor: theme.tokens.colors.hoverSoft,
  border: theme.tokens.borders.paper,
  whiteSpace: "nowrap",
});

// Tab bar: underline indicator and muted → strong labels (theme MuiTabs/MuiTab).
export const tabsBoxStyles = (theme: Theme): SxProps<Theme> => ({
  mt: 2,
  mx: { xs: -1, sm: -1.5 },
  "& .MuiTab-root": { px: { xs: 1, sm: 1.5 } },
  "& .MuiTab-root .MuiTab-iconWrapper": { color: theme.tokens.colors.textSubtle },
  "& .MuiTab-root.Mui-selected .MuiTab-iconWrapper": { color: theme.tokens.colors.accent },
});

export const contentBoxStyles = (theme: Theme): SxProps<Theme> => ({
  // Scrolls inside the card on desktop; on phones the whole page scrolls.
  display: "flex",
  flexDirection: "column",
  flex: { md: 1 },
  minHeight: { md: 0 },
  overflow: { md: "auto" },
  px: { xs: 2.5, sm: 3 },
  pt: { xs: 2.5, sm: 3 },
  pb: { xs: 2.5, sm: 3 },
});

// Vertical stack of the cards inside a tab. Spacing is handled by the theme's
// Paper margin (mb: 3 set on sectionPaperStyles), like in the rest of the app.
// On md+ the stack takes the height left by the header/tabs so the card marked
// with `fillSectionPaperStyles` can reach the bottom of the page.
export const cardStackStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: { md: 1 },
  minHeight: { md: 0 },
};

// Inner cards follow the same panel treatment as Configuraciones: 16px radius,
// 1px border, paper background and the shared soft shadow.
export const sectionPaperStyles = (theme: Theme): SxProps<Theme> => ({
  p: { xs: 2, sm: 2.5 },
  borderRadius: "14px",
  border: `1px solid ${softBorder(theme)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: panelShadow(theme),
  mb: 2,
});

// Last card of a tab: same panel treatment, but it stretches to the bottom of
// the page on md+ and lets its table/list scroll instead of leaving empty space
// below the last row.
export const fillSectionPaperStyles = (theme: Theme): SxProps<Theme> => ({
  ...sectionPaperStyles(theme),
  display: "flex",
  flexDirection: "column",
  flex: { md: 1 },
  minHeight: { md: 0 },
  mb: 0,
});

// ─── Section header (identical to Configuraciones) ───
// icon (20px, primary) + h6 title, then a short caption description, then a
// hairline divider. See `SectionHeader` for the composed component.
export const sectionHeaderStyles: SxProps<Theme> = {
  mb: 2,
  flexShrink: 0,
};

export const sectionHeaderRowStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  flexWrap: { xs: "nowrap", md: "wrap" },
  gap: 1.5,
  mb: { xs: 1.5, md: 2 },
};

export const sectionHeaderIconStyles = (theme: Theme): SxProps<Theme> => ({
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: "9px",
  display: "grid",
  placeItems: "center",
  color: theme.tokens.colors.accent,
  backgroundColor: theme.tokens.colors.accentSoft,
  "& svg": { width: 16, height: 16 },
});

export const sectionTitleStyles: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: "1rem",
  letterSpacing: "-0.015em",
  lineHeight: 1.3,
  color: "text.primary",
};

export const sectionDescStyles: SxProps<Theme> = {
  display: "block",
  mt: 0.25,
  color: "text.secondary",
  fontSize: "0.8125rem",
  lineHeight: 1.4,
};

export const sectionDividerStyles = (theme: Theme): SxProps<Theme> => ({
  borderBottom: `1px solid ${hairline(theme)}`,
  mt: { xs: -0.5, md: -0.5 },
  mb: { xs: 2, md: 2.5 },
});

// Empty state of a filling card: it takes the same space the table would take,
// so the message stays centered in the card instead of leaving the bottom empty.
export const emptyStateBoxStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: { md: 1 },
  minHeight: { md: 0 },
  gap: 1.5,
  py: 6,
  px: 2,
  textAlign: "center",
  borderRadius: "16px",
  color: "text.secondary",
  border: `1px dashed ${softBorder(theme)}`,
  backgroundColor: theme.tokens.colors.surfaceSunken,
});

// Bounded height so the table header can stay sticky while the rows scroll.
// Scrollbar is kept ultra subtle so the tables don't feel boxed in.
// Table area of the filling cards: on md+ it takes the height left by the
// section header and scrolls; on phones it keeps a fixed maximum height.
export const tableContainerStyles = (theme: Theme): SxProps<Theme> => ({
  flex: { md: 1 },
  minHeight: { md: 0 },
  maxHeight: { xs: "none", md: 440 },
  overflow: "auto",
  borderRadius: "10px",
  border: theme.tokens.borders.paper,
});

// Opaque background is required by MUI's stickyHeader so rows don't show
// through while scrolling.
export const tableHeaderCellStyles = (theme: Theme) => ({
  fontWeight: 600,
  fontSize: "0.6875rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: theme.tokens.colors.tableHeadText,
  backgroundColor: theme.tokens.colors.tableHeadBg,
  borderBottom: theme.tokens.borders.headCell,
  py: 1,
  whiteSpace: "nowrap" as const,
});

export const tableCellStyles = (theme: Theme) => ({
  fontSize: "0.875rem",
  color: theme.tokens.colors.textOnSunken,
  py: 1.25,
  borderBottom: theme.tokens.borders.hairline,
  verticalAlign: "middle" as const,
});
