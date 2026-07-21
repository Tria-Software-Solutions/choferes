import { SxProps, Theme } from "@mui/material";

export const wrapper: SxProps<Theme> = {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#242438",
  color: "#ffffff",
  position: "relative",
  overflow: "hidden",
  "& .MuiTypography-root": {
    color: "#ffffff",
  },
};

export const content: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  width: "100%",
  maxWidth: 600,
  px: { xs: 3, md: 6 },
  position: "relative",
  zIndex: 1,
};

export const imageStyles: SxProps<Theme> = {
  width: { xs: "85%", sm: "75%", md: "70%" },
  maxWidth: 500,
  height: "auto",
  mb: { xs: 3, sm: 4 },
  filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.08))",
};

export const titleStyles: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: "1.75rem", md: "2.25rem" },
  letterSpacing: -0.5,
  lineHeight: 1.2,
  mb: 1.5,
};

export const subtitleStyles: SxProps<Theme> = {
  fontSize: { xs: "0.95rem", md: "1.05rem" },
  fontWeight: 600,
  opacity: 0.8,
  mb: 1.5,
  lineHeight: 1.5,
};

export const descriptionStyles: SxProps<Theme> = {
  fontSize: { xs: "0.85rem", md: "0.95rem" },
  fontWeight: 400,
  opacity: 0.5,
  lineHeight: 1.7,
  maxWidth: 480,
  mb: { xs: 3, sm: 4 },
};

export const actionsBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1.5, sm: 2 },
  justifyContent: "center",
  flexWrap: "wrap",
};

export const primaryButtonStyles: SxProps<Theme> = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.875rem, 1.25vw, 1rem)",
  fontWeight: 600,
  px: { xs: 3, sm: 5 },
  py: { xs: 1.25, sm: 1.5 },
  borderRadius: "8px",
  textTransform: "none",
  color: "#ffffff",
};

export const captionStyles: SxProps<Theme> = {
  mt: { xs: 3, sm: 4 },
  display: "block",
  opacity: 0.4,
  fontSize: { xs: "0.7rem", sm: "0.75rem" },
};