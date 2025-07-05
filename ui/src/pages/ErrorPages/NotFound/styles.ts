import { SxProps, Theme } from "@mui/material";

export const outerBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  textAlign: "center",
  px: 3,
};

export const innerBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  maxHeight: "100vh",
  py: { xs: 2, sm: 3 },
};

export const iconStyles = (theme: Theme): SxProps<Theme> => ({
  fontSize: 120,
  color: theme.palette.info.main,
  mb: 3,
  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
});

export const titleStyles = (theme: Theme): SxProps<Theme> => ({
  background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  mb: 2,
  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  fontSize: { xs: "4rem", md: "6rem" },
  fontWeight: "bold",
});

export const subtitleStyles: SxProps<Theme> = {
  mb: 2,
  fontWeight: 500,
};

export const descriptionStyles: SxProps<Theme> = {
  mb: 4,
  lineHeight: 1.6,
};

export const actionsBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1, sm: 2 },
  justifyContent: "center",
  flexWrap: "wrap",
};

export const homeButtonStyles: SxProps<Theme> = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  fontWeight: 600,
  px: { xs: 2, sm: 4 },
  py: { xs: 1, sm: 1.5 },
};

export const exploreButtonStyles: SxProps<Theme> = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
};

export const captionStyles: SxProps<Theme> = {
  mt: 4,
  display: "block",
  opacity: 0.7,
};
