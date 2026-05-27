import { SxProps, Theme } from "@mui/material";

export const wrapper: SxProps<Theme> = {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "stretch",
};

export const split: SxProps<Theme> = (theme) => ({
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  flex: 1,
  overflow: "hidden",
  boxShadow: "none",
  borderRadius: 0,
  "@media (max-width:900px)": {
    flexDirection: "column",
  },
});

export const left: SxProps<Theme> = {
  flex: 1.15,
  display: { xs: 'none', md: 'flex' },
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  p: { xs: 6, md: 10 },
  py: { xs: 6, md: 8 },
  minHeight: "100vh",
  position: 'relative',
  overflow: 'hidden',
  background: '#0f0f1a',
  color: '#ffffff',
  '& .MuiTypography-root': {
    color: '#ffffff',
  },
};

export const right: SxProps<Theme> = (theme: Theme) => ({
  flex: { xs: 1, md: 0.85 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: { xs: 3, md: 8 },
  background: theme.palette.background.default,
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
});

export const formContainer: SxProps<Theme> = {
  width: "100%",
  maxWidth: { xs: "100%", sm: 420 },
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

export const formPanel: SxProps<Theme> = (theme) => ({
  width: "100%",
  background: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  padding: { xs: 0, md: 0 },
});

export const header: SxProps<Theme> = {
  mb: 3,
  textAlign: "center",
};

export const form: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const footer: SxProps<Theme> = {
  py: 2,
  textAlign: "center",
  color: "rgba(0,0,0,0.4)",
  display: "flex",
  flexDirection: "column",
  gap: 0.25,
};
