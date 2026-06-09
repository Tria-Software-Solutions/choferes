import { keyframes } from '@emotion/react';
import { SxProps, Theme } from "@mui/material";

export const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); max-height: 0; }
  to { opacity: 1; transform: translateY(0); max-height: 100px; }
`;

export const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`;

export const blobFloat = keyframes`
  0%, 100% { transform: scale(1) translate(0, 0); }
  33% { transform: scale(1.03) translate(8px, -8px); }
  66% { transform: scale(0.97) translate(-4px, 4px); }
`;

export const wrapper: SxProps<Theme> = {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "stretch",
  position: "relative",
};

export const split: SxProps<Theme> = () => ({
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
  flex: 1,
  display: { xs: 'none', md: 'flex' },
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  p: { xs: 6, md: 10 },
  py: { xs: 6, md: 8 },
  minHeight: "100vh",
  position: 'relative',
  background: theme.palette.mode === 'dark' ? '#0f0f1a' : theme.palette.background.default,
  color: '#ffffff',
  '& .MuiTypography-root': {
    color: 'inherit',
  },
});

export const right: SxProps<Theme> = (theme: Theme) => ({
  flex: { xs: 1, md: '0 0 auto' },
  width: { xs: '100%', md: 560 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: { xs: 3, md: 8 },
  background: theme.palette.mode === 'dark' ? '#0f0f1a' : theme.palette.background.default,
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

export const header: SxProps<Theme> = {
  mb: 4,
  textAlign: "center",
};

export const form: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const inputIconStyles: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  fontSize: '1.1rem',
  opacity: 0.5,
});

export const optionsRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mx: 0.5,
  my: 0.5,
};

export const checkboxStyles: SxProps<Theme> = (theme) => ({
  '& .MuiCheckbox-root': {
    padding: '4px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.1rem',
      color: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.4)'
        : 'rgba(0,0,0,0.3)',
    },
    '&.Mui-checked .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiFormControlLabel-label': {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    userSelect: 'none',
  },
});

export const forgotLinkStyles: SxProps<Theme> = (theme) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    color: theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.dark,
  },
});

export const forgotHeader: SxProps<Theme> = {
  mb: 4,
  textAlign: 'center',
};

export const forgotDescription: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  lineHeight: 1.6,
  mb: 3,
  textAlign: 'center',
});

export const backLinkStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5,
  mt: 3,
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
});

export const poweredByStyles: SxProps<Theme> = {
  display: 'block',
  textAlign: 'center',
  mt: 4,
  pt: 3,
  borderTop: '1px solid',
  borderColor: 'divider',
  color: 'text.secondary',
  fontSize: '0.6rem',
  letterSpacing: '0.04em',
  fontWeight: 400,
};

export const animateStagger = (delayMs: number): SxProps<Theme> => ({
  animation: `${fadeSlideUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  animationDelay: `${delayMs}ms`,
  opacity: 0,
});
