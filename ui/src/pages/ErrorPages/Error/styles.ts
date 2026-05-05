import { SxProps, Theme } from "@mui/material";
import blurredBg from "../../../assets/images/choferesblurred1.webp";

export const outerBoxStyles: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: { xs: 1, sm: 2 },
  height: "100vh",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  margin: 0,
  // Premium blurred background image
  backgroundImage: `url(${blurredBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  // Light overlay to preserve image colors
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(135deg, rgba(15,15,20,0.45) 0%, rgba(20,20,30,0.35) 50%, rgba(15,15,25,0.45) 100%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(250,250,252,0.15) 50%, rgba(245,245,250,0.2) 100%)",
    zIndex: 0,
  },
  // Subtle color enhancement orbs
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === "dark"
      ? `radial-gradient(ellipse at 30% 70%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
         radial-gradient(ellipse at 70% 30%, rgba(255, 119, 198, 0.08) 0%, transparent 50%)`
      : `radial-gradient(ellipse at 30% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
         radial-gradient(ellipse at 70% 30%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)`,
    animation: "gradientShift 20s ease-in-out infinite",
    zIndex: 0,
  },
  "@keyframes gradientShift": {
    "0%, 100%": {
      opacity: 1,
      transform: "scale(1)",
    },
    "50%": {
      opacity: 0.85,
      transform: "scale(1.05)",
    },
  },
});

export const innerBoxStyles: SxProps<Theme> = (theme) => ({
  width: { xs: "100%", sm: 420, md: 440 },
  maxWidth: "100%",
  borderRadius: "24px",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  py: { xs: 2, sm: 3 },
  px: { xs: 2, sm: 2, md: 3 },
  mx: "auto",
  background: theme.palette.mode === "dark"
    ? "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(35,35,35,0.85) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.9) 100%)",
  boxShadow: theme.palette.mode === "dark"
    ? "0 32px 64px rgba(0,0,0,0.5), 0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 32px 64px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  zIndex: 1,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: theme.palette.mode === "dark"
      ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
  },
});

export const iconStyles = (theme: Theme): SxProps<Theme> => ({
  fontSize: { xs: 48, sm: 64, md: 72 },
  color: theme.palette.text.primary,
  mb: { xs: 2, sm: 3 },
});

export const titleStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.text.primary,
  mb: { xs: 1, sm: 2 },
  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
  fontWeight: 800,
  letterSpacing: "-0.02em",
});

export const subtitleStyles: SxProps<Theme> = {
  mb: { xs: 1, sm: 2 },
  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
  fontWeight: 600,
  color: "text.primary",
};

export const descriptionStyles: SxProps<Theme> = {
  mb: { xs: 2, sm: 3 },
  lineHeight: 1.5,
  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.9rem" },
  maxWidth: 500,
  color: "text.secondary",
};

export const actionsBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 2 },
  justifyContent: "center",
  flexWrap: "wrap",
  width: "100%",
};

export const homeButtonStyles: SxProps<Theme> = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.875rem, 1.25vw, 1rem)",
  fontWeight: 600,
  px: { xs: 2.5, sm: 4 },
  py: { xs: 1.25, sm: 1.5 },
  borderRadius: "8px",
  textTransform: "none",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  "&:hover": {
    boxShadow: "0 2px 6px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
  },
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
};

export const reloadButtonStyles: SxProps<Theme> = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.875rem, 1.25vw, 1rem)",
  fontWeight: 600,
  px: { xs: 2.5, sm: 4 },
  py: { xs: 1.25, sm: 1.5 },
  borderRadius: "8px",
  textTransform: "none",
  "&:hover": {
    boxShadow: "0 2px 6px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
  },
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
};

export const captionStyles: SxProps<Theme> = {
  mt: { xs: 2, sm: 3 },
  display: "block",
  opacity: 0.7,
  fontSize: { xs: "0.7rem", sm: "0.75rem" },
};
