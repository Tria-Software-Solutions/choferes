import { SxProps, Theme } from "@mui/material";

export const drawerPaperStyles = (theme: Theme): SxProps<Theme> => ({
  width: { xs: "100vw", sm: "min(320px, 85vw)" },
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(18,18,22,0.97)" : "rgba(255,255,255,0.98)",
  backdropFilter: "blur(20px)",
  border: "none",
  borderLeft: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  }`,
  borderRadius: { xs: 0, sm: "16px 0 0 16px" },
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

export const drawerHeaderStyles: SxProps<Theme> = {
  px: 2.5,
  pt: 2,
  pb: 2,
  background: "#000000",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
};

export const drawerHeaderTitleStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  color: "#ffffff",
};

export const drawerLogoStyles: SxProps<Theme> = {
  width: 26,
  height: "auto",
  display: "block",
};

export const drawerCloseButtonStyles: SxProps<Theme> = {
  color: "#ffffff",
  backgroundColor: "rgba(255,255,255,0.08)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  transition: "all 0.2s ease",
};

export const drawerUserCardStyles = (theme: Theme): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  px: 2.5,
  py: 1.5,
  borderBottom: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
  }`,
  flexShrink: 0,
});

export const drawerAvatarStyles: SxProps<Theme> = {
  width: 44,
  height: 44,
  fontSize: "0.95rem",
  fontWeight: 700,
  flexShrink: 0,
  background: "#2a2a2f",
  color: "#ffffff",
  border: "1.5px solid rgba(255,255,255,0.25)",
};

export const drawerSectionLabelStyles = (theme: Theme): SxProps<Theme> => ({
  px: 2.5,
  pt: 1.75,
  pb: 0.5,
  fontSize: "0.68rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: theme.palette.text.secondary,
});

export const drawerNavListStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
  px: 1.5,
  overflowY: "auto",
  flex: 1,
  minHeight: 0,
};

export const drawerAccountListStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
  px: 1.5,
  flexShrink: 0,
  pb: 1.5,
};

export const drawerNavRowStyles = (
  theme: Theme,
  active: boolean,
  depth: number,
): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1.25,
  py: 1,
  minHeight: 48,
  borderRadius: "12px",
  cursor: "pointer",
  position: "relative",
  ml: depth > 0 ? 2.5 : 0,
  backgroundColor: active
    ? theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.06)"
    : "transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: active
      ? theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.14)"
        : "rgba(0,0,0,0.1)"
      : theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)",
  },
  "&::before": active
    ? {
        content: '""',
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 3,
        height: 18,
        borderRadius: 3,
        backgroundColor: theme.palette.primary.main,
      }
    : undefined,
});

export const drawerNavIconStyles = (theme: Theme, active: boolean): SxProps<Theme> => ({
  width: 34,
  height: 34,
  borderRadius: "10px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: active
    ? theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.18)"
      : "rgba(0,0,0,0.12)"
    : theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.04)",
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: "all 0.2s ease",
});

export const drawerNavTextStyles = (theme: Theme, active: boolean): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  fontWeight: active ? 700 : 600,
  fontSize: "0.85rem",
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  transition: "color 0.2s ease",
});

export const drawerActionRowStyles = (theme: Theme, isLogout: boolean): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1.25,
  py: 1,
  minHeight: 48,
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: isLogout
      ? `${theme.palette.error.main}12`
      : theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)",
  },
});

export const drawerActionIconStyles = (theme: Theme, isLogout: boolean): SxProps<Theme> => ({
  width: 34,
  height: 34,
  borderRadius: "10px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: isLogout
    ? `${theme.palette.error.main}14`
    : theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.04)",
  color: isLogout ? theme.palette.error.main : theme.palette.text.secondary,
  transition: "all 0.2s ease",
});

export const drawerActionTextStyles = (theme: Theme, isLogout: boolean): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  fontWeight: 600,
  fontSize: "0.85rem",
  color: isLogout ? theme.palette.error.main : theme.palette.text.primary,
});

export const drawerDividerStyles = (theme: Theme): SxProps<Theme> => ({
  my: 1.5,
  mx: 2.5,
  borderColor:
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
});

export const drawerFooterStyles = (theme: Theme): SxProps<Theme> => ({
  px: 2.5,
  py: 1.25,
  borderTop: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
  }`,
  flexShrink: 0,
});
