import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

export const appBarStyles: SxProps<Theme> = {
  background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
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
  p: 1,
  borderRadius: 2,
  backgroundColor: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
};

export const logoImgStyles: CSSProperties = {
  width: "32px",
  height: "auto",
};

export const titleStyles: SxProps<Theme> = {
  fontFamily: "'Urbanist', sans-serif",
  fontWeight: 800,
  fontSize: { xs: "1.5rem", sm: "2rem", md: "1.5rem" },
  lineHeight: 1.1,
  letterSpacing: "0.04em",
  background: "linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: { xs: "none", sm: "block" },
};

export const dashboardPopoverBoxStyles: SxProps<Theme> = {
  mt: 2,
  display: "flex",
  flexDirection: "row",
  gap: 2,
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.8)",
  p: 2,
  borderRadius: 2,
};

export const dashboardIconButtonStyles = (
  active: boolean = false,
): SxProps<Theme> => ({
  color: "#ffffff",
  cursor: "pointer",
  p: 1.5,
  borderRadius: "50%",
  minWidth: "56px",
  height: "56px",
  backgroundColor: active ? "rgba(255,255,255,0.25)" : "transparent",
  border: active ? "2px solid rgba(255,255,255,0.6)" : "none",
  "&:hover": {
    backgroundColor: active
      ? "rgba(255,255,255,0.35)"
      : "rgba(255,255,255,0.15)",
    transform: "translateY(-2px)",
  },
  transition: "all 0.3s ease",
});

export const dashboardIconStyles = (
  active: boolean = false,
): CSSProperties => ({
  width: "1.6rem",
  height: "1.6rem",
  color: "#ffffff",
  filter: active ? "drop-shadow(0 0 8px rgba(255,255,255,0.6))" : "none",
});

export const notificationsIconButtonStyles: SxProps<Theme> = {
  color: "#ffffff",
  backgroundColor: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.2)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: "scale(1.05)",
  },
  transition: "all 0.3s ease",
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
  p: 0.5,
  border: "2px solid rgba(255,255,255,0.3)",
  backgroundColor: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  "&:hover": {
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: "scale(1.05)",
  },
  transition: "all 0.3s ease",
};

export const userAvatarStyles: SxProps<Theme> = {
  width: 40,
  height: 40,
  backgroundColor: "rgba(255,255,255,0.2)",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "1rem",
};

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

export const logoutMenuItemStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.error.main,
});
