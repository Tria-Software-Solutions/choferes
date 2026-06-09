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
  width: { xs: '100%', md: 480 },
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
  maxWidth: { xs: "100%", sm: 384 },
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

export const header: SxProps<Theme> = {
  mb: 4,
  textAlign: "left",
};

export const form: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const inputLabelStyles: SxProps<Theme> = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  mb: 0.5,
  color: 'text.primary',
};

export const inputFieldStyles: SxProps<Theme> = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
    '& input': {
      py: 1.5,
      px: 1.5,
      fontSize: '0.875rem',
      color: theme.palette.text.primary,
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 0.5,
      },
    },
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.15)'
        : 'rgba(0,0,0,0.2)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.3)'
        : 'rgba(0,0,0,0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
      borderWidth: '1px',
    },
    '&.Mui-focused.Mui-error fieldset': {
      borderWidth: '2px',
    },
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
    mt: 0.5,
  },
});

export const submitButtonStyles: SxProps<Theme> = (theme) => ({
  borderRadius: '8px',
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.875rem',
  textTransform: 'none',
  py: 1.5,
  px: 3,
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.dark,
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  },
  '&:disabled': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(0,0,0,0.12)',
    color: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.3)'
      : 'rgba(0,0,0,0.26)',
  },
});

export const optionsRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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
    fontSize: '0.875rem',
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
  textAlign: 'left',
};

export const forgotDescription: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  lineHeight: 1.6,
  textAlign: 'left',
});

export const backLinkStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 0.5,
  mt: 3,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.dark,
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

export const submitProgressStyles: SxProps<Theme> = {
  mr: 1,
};

export const alertStyles: SxProps<Theme> = {
  mt: 3,
  borderRadius: '8px',
  '& .MuiAlert-icon': {
    alignItems: 'center',
  },
};
