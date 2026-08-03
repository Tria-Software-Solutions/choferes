import { SxProps, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";
import { CSSProperties } from "react";

export const appBarStyles: SxProps<Theme> = {
  background: "#000000",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  top: 0,
  zIndex: 1100,
};

export const toolbarStyles: SxProps<Theme> = {
  minHeight: { xs: "64px", md: "72px" },
  px: { xs: 2, md: 3 },
  justifyContent: "space-between",
};

export const clickableBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.02)",
  },
};

export const logoBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  mr: 2,
};

export const logoImgStyles: CSSProperties = {
  width: "32px",
  height: "auto",
};

export const titleStyles: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "1.5rem", sm: "2rem", md: "1.5rem" },
  lineHeight: 1.1,
  letterSpacing: "0.04em",
  color: "#ffffff",
  display: { xs: "none", sm: "block" },
};

export const dashboardPopoverBoxStyles: SxProps<Theme> = (theme) => ({
  mt: 2,
  display: 'flex',
  flexDirection: 'row',
  gap: 1,
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(0,0,0,0.95)'
    : '#ffffff',
  backdropFilter: 'blur(20px)',
  p: 1,
  borderRadius: '12px',
  border: 'none',
  boxShadow: 'none',
  maxWidth: 'calc(100vw - 32px)',
  overflowX: 'auto',
  overflowY: 'hidden',
  '&::-webkit-scrollbar': {
    height: 4,
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.2)'
      : 'rgba(0,0,0,0.2)',
    borderRadius: 2,
  },
});

export const dashboardIconButtonStyles = (
  active: boolean = false,
): SxProps<Theme> => (theme) => ({
  color: theme.palette.text.primary,
  cursor: 'pointer',
  p: 1,
  borderRadius: '12px',
  minWidth: '48px',
  height: '48px',
  backgroundColor: active 
    ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)') 
    : 'transparent',
  border: 'none',
  position: 'relative',
  '&:hover': {
    backgroundColor: active
      ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)')
      : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
  },
  '&:active': {
    backgroundColor: active
      ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.16)')
      : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'),
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

export const dashboardIconStyles = (
  active: boolean = false,
): CSSProperties => ({
  width: '1.4rem',
  height: '1.4rem',
  transition: 'all 0.2s ease',
});

export const notificationsIconButtonStyles: SxProps<Theme> = {
  color: "#ffffff",
  backgroundColor: "transparent",
  border: "none",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  transition: "all 0.2s ease",
};

export const dividerStyles: SxProps<Theme> = {
  mx: 1,
  borderColor: "rgba(255,255,255,0.2)",
};

export const userBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const userNameStyles: SxProps<Theme> = {
  color: "#ffffff",
  fontWeight: 600,
  lineHeight: 1.2,
};

export const userEmailStyles: SxProps<Theme> = {
  color: "rgba(255,255,255,0.7)",
  fontSize: "0.75rem",
};

export const userMenuIconButtonStyles: SxProps<Theme> = {
  p: 0,
  border: "none",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "transparent",
  },
  transition: "all 0.3s ease",
};

export const userAvatarStyles: SxProps<Theme> = (theme) => ({
  width: 44,
  height: 44,
  background: theme.palette.mode === "dark" ? "#3a3a3f" : "#1a1a1a",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "0.9rem",
  border: "1.5px solid rgba(255,255,255,0.25)",
  borderRadius: "50%",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
});

export const mobileDividerStyles: SxProps<Theme> = {
  borderColor: "rgba(255,255,255,0.2)",
};

export const menuPaperStyles: SxProps<Theme> = (theme) => ({
  mt: 1,
  minWidth: 200,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 2,
});

export const notificationsMenuPaperStyles: SxProps<Theme> = (theme) => ({
  mt: 1,
  minWidth: 300,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 2,
});

export const dashboardNoLinksBoxStyles: SxProps<Theme> = {
  color: "white",
  p: 1,
};

// ─── User menu (avatar dropdown: profile header + actions) ───

export const userMenuPaperStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  mt: 0.5,
  minWidth: 230,
  backgroundColor: theme.palette.mode === "dark" ? "#1e1e23" : "#ffffff",
  border: `1px solid ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
  }`,
  borderRadius: "14px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 12px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)"
      : "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
  overflow: "hidden",
  padding: 0,
});

export const userMenuDividerStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  my: 0.5,
  mx: 1,
  borderColor:
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
});

export const userMenuItemStyles = (theme: Theme, isLogout: boolean): SystemStyleObject<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1.25,
  py: 0.85,
  mx: 0.75,
  my: 0.25,
  borderRadius: "10px",
  transition: "all 0.15s ease",
  color: isLogout ? theme.palette.error.main : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: isLogout
      ? `${theme.palette.error.main}14`
      : theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)",
  },
});

export const userMenuIconChipStyles = (theme: Theme, isLogout: boolean): SystemStyleObject<Theme> => ({
  width: 32,
  height: 32,
  borderRadius: "9px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: isLogout
    ? `${theme.palette.error.main}14`
    : theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.07)"
      : "rgba(0,0,0,0.05)",
  color: isLogout ? theme.palette.error.main : theme.palette.primary.main,
});
