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
  fontSize: { xs: 80, sm: 100, md: 120 },
  color: theme.palette.error.main,
  mb: { xs: 2, sm: 3 },
  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
});

export const titleStyles = (theme: Theme): SxProps<Theme> => ({
  background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  mb: { xs: 1, sm: 2 },
  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
  fontWeight: "bold",
});

export const subtitleStyles: SxProps<Theme> = {
  mb: { xs: 1, sm: 2 },
  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
  fontWeight: 500,
};

export const descriptionStyles: SxProps<Theme> = {
  mb: { xs: 2, sm: 3, md: 4 },
  lineHeight: 1.6,
  fontSize: { xs: "0.875rem", sm: "1rem" },
  maxWidth: 500,
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
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
  fontWeight: 600,
  px: { xs: 2, sm: 4 },
  py: { xs: 1, sm: 1.5 },
};

export const reloadButtonStyles: SxProps<Theme> = {
  minHeight: { xs: 44, sm: 48 },
  fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
};

export const captionStyles: SxProps<Theme> = {
  mt: { xs: 2, sm: 3, md: 4 },
  display: "block",
  opacity: 0.7,
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
}; 