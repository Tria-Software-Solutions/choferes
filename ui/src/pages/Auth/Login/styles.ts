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

export const left: SxProps<Theme> = (theme) => ({
  flex: 1.15,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  p: { xs: 6, md: 10 },
  background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%)`,
  color: "#ffffff",
  minHeight: "100vh",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: 'relative',
  overflow: 'hidden',
  "&::before": {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 10% 20%, rgba(255,255,255,0.06), transparent 10%),
                 radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04), transparent 15%),
                 radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02), transparent 20%)`,
    mixBlendMode: 'overlay',
    animation: 'moveBG 10s linear infinite',
    zIndex: 0,
  },
  "@keyframes moveBG": {
    "0%": { transform: 'translateY(0) scale(1)' },
    "50%": { transform: 'translateY(-6%) scale(1.02)' },
    "100%": { transform: 'translateY(0) scale(1)' },
  },
  "& > *": {
    position: 'relative',
    zIndex: 1,
  },
});

export const right: SxProps<Theme> = (theme: Theme) => ({
  flex: 0.85,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: { xs: 4, md: 8 },
  background: theme.palette.background.default,
  minHeight: "100vh",
});

export const formContainer: SxProps<Theme> = {
  width: "100%",
  maxWidth: 420,
  margin: "0 auto",
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
  mt: 3,
  textAlign: "center",
  color: "rgba(0,0,0,0.6)",
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};
