import { SxProps, Theme } from "@mui/material";

export const wrapper: SxProps<Theme> = {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: (theme) => theme.palette.background.default,
  position: "relative",
  overflow: "hidden",
};

export const content: SxProps<Theme> = {
  width: "100%",
  maxWidth: 480,
  mx: 2,
};

export const imageStyles: SxProps<Theme> = {
  width: { xs: "75%", sm: "65%" },
  maxWidth: 340,
  height: "auto",
  display: "block",
  mx: "auto",
  mb: 3,
  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.06))",
};

export const subtitleStyles: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: "1.1rem", md: "1.25rem" },
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  color: (theme) => theme.palette.text.primary,
  textAlign: "center",
  mb: 0.5,
};

export const errorCodeText: SxProps<Theme> = {
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.02em",
  color: (theme) => theme.palette.text.secondary,
  textAlign: "center",
  display: "block",
};

export const descriptionStyles: SxProps<Theme> = {
  fontSize: { xs: "0.875rem", md: "0.9375rem" },
  fontWeight: 400,
  color: (theme) => theme.palette.text.secondary,
  lineHeight: 1.7,
  mb: { xs: 3, sm: 4 },
};

export const actionsBoxStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: { xs: 1.5, sm: 2 },
  justifyContent: "center",
  flexWrap: "wrap",
};

export const captionStyles: SxProps<Theme> = {
  mt: { xs: 3, sm: 4 },
  display: "block",
  textAlign: "center",
  fontSize: { xs: "0.75rem", sm: "0.8rem" },
  color: (theme) => theme.palette.text.secondary,
};
