import { SxProps, Theme } from "@mui/material";

// Mobile navigation drawer: same surfaces, type scale and active treatment as
// the desktop top bar (see components/AppBar/TopNav).

export const drawerPaperStyles = (theme: Theme): SxProps<Theme> => ({
  width: { xs: "100vw", sm: "min(340px, 88vw)" },
  backgroundColor: theme.tokens.colors.surface,
  borderLeft: theme.tokens.borders.paper,
  borderRadius: { xs: 0, sm: "18px 0 0 18px" },
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

export const drawerHeaderStyles: SxProps<Theme> = (theme: Theme) => ({
  px: 2,
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderBottom: theme.tokens.borders.hairline,
});

export const drawerHeaderTitleStyles: SxProps<Theme> = (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  color: theme.tokens.colors.text,
  fontWeight: 800,
});

export const drawerLogoStyles: SxProps<Theme> = {
  width: 28,
  height: "auto",
  display: "block",
};

export const drawerCloseButtonStyles: SxProps<Theme> = {};

export const drawerUserCardStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  m: 1.5,
  p: 1.5,
  borderRadius: "12px",
  border: theme.tokens.borders.paper,
  backgroundColor: theme.tokens.colors.surfaceSunken,
  flexShrink: 0,
});

export const drawerAvatarStyles: SxProps<Theme> = {
  width: 40,
  height: 40,
  fontSize: "0.875rem",
  flexShrink: 0,
};

export const drawerSectionLabelStyles = (theme: Theme): SxProps<Theme> => ({
  px: 2.5,
  pt: 1.5,
  pb: 0.75,
  fontSize: "0.6875rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: theme.tokens.colors.textMuted,
});

export const drawerNavListStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.25,
  px: 1.25,
  overflowY: "auto",
  flex: 1,
  minHeight: 0,
};

export const drawerAccountListStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.25,
  px: 1.25,
  flexShrink: 0,
  pb: 1.5,
};

export const drawerNavRowStyles = (theme: Theme, active: boolean, depth: number): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1.25,
  minHeight: 46,
  borderRadius: "10px",
  cursor: "pointer",
  ml: depth > 0 ? 2.5 : 0,
  backgroundColor: active ? theme.tokens.colors.selected : "transparent",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: active ? theme.tokens.colors.selected : theme.tokens.colors.hover,
  },
});

export const drawerNavIconStyles = (theme: Theme, active: boolean): SxProps<Theme> => ({
  width: 32,
  height: 32,
  borderRadius: "9px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: active ? theme.tokens.colors.accentSoft : "transparent",
  color: active ? theme.tokens.colors.accent : theme.tokens.colors.textMuted,
  "& svg": { width: 18, height: 18 },
});

export const drawerNavTextStyles = (theme: Theme, active: boolean): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  fontWeight: active ? 700 : 500,
  fontSize: "0.9rem",
  color: active ? theme.tokens.colors.text : theme.tokens.colors.textButton,
});

export const drawerActionRowStyles = (theme: Theme, isLogout: boolean): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1.25,
  minHeight: 46,
  borderRadius: "10px",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: isLogout ? theme.tokens.colors.errorSoft : theme.tokens.colors.hover,
  },
});

export const drawerActionIconStyles = (theme: Theme, isLogout: boolean): SxProps<Theme> => ({
  width: 32,
  height: 32,
  borderRadius: "9px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: isLogout ? theme.tokens.colors.error : theme.tokens.colors.textMuted,
  "& svg": { width: 18, height: 18 },
});

export const drawerActionTextStyles = (theme: Theme, isLogout: boolean): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  fontWeight: 500,
  fontSize: "0.9rem",
  color: isLogout ? theme.tokens.colors.error : theme.tokens.colors.textButton,
});

export const drawerDividerStyles = (theme: Theme): SxProps<Theme> => ({
  my: 1.25,
  mx: 2.5,
  borderColor: theme.tokens.colors.borderHairline,
});

export const drawerFooterStyles = (theme: Theme): SxProps<Theme> => ({
  px: 2.5,
  py: 1.25,
  borderTop: theme.tokens.borders.hairline,
  flexShrink: 0,
});
