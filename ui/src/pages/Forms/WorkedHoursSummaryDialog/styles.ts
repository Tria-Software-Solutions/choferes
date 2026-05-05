import { Theme } from '@mui/material/styles';
import { CSSProperties } from 'react';

// Premium container styles
export const containerBox = {
  p: { xs: 2, sm: 3 },
};

// Premium tab list styling
export const tabListSx = (theme: Theme) => ({
  minHeight: 56,
  backgroundColor: 'transparent',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '2px 2px 0 0',
    background: theme.palette.primary.main,
  },
  '& .MuiTab-root': {
    minWidth: 'auto',
    fontSize: { xs: '0.875rem', sm: '0.95rem' },
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '-0.01em',
    padding: { xs: '12px 16px', sm: '14px 20px' },
    color: theme.palette.text.secondary,
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(0,0,0,0.02)',
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
  },
});

// Premium divider styling
export const premiumDivider = (theme: Theme) => ({
  mb: 3,
  borderColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.06)',
  borderWidth: 1,
});

// Premium avatar styling with solid colors
export const premiumAvatarStyles = (
  theme: Theme,
  colorType: 'success' | 'info' | 'warning' | 'error',
) => {
  const colors = {
    success: '#10b981',
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
  };
  
  return {
    width: 72,
    height: 72,
    background: colors[colorType],
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 24px rgba(0,0,0,0.4)'
      : '0 8px 24px rgba(0,0,0,0.15)',
  };
};

// Premium content box styling
export const contentBox = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 2.5, sm: 3 },
  p: { xs: 2, sm: 2.5 },
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Premium title styling
export const titleTypography = (theme: Theme) => ({
  fontWeight: 700,
  fontSize: { xs: '1rem', sm: '1.125rem' },
  letterSpacing: '-0.02em',
  color: theme.palette.text.primary,
  mb: 0.5,
});

// Premium hours display styling
export const hoursTypography = (theme: Theme) => ({
  variant: 'h3',
  fontWeight: 800,
  fontSize: { xs: '2.5rem', sm: '3rem' },
  letterSpacing: '-0.03em',
  lineHeight: 1,
  color: theme.palette.primary.main,
  mb: 1,
});

// Premium subtitle styling
export const subtitleTypography = (theme: Theme) => ({
  variant: 'body2',
  fontWeight: 500,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  letterSpacing: '-0.01em',
  color: theme.palette.text.secondary,
});

// Premium info box styling
export const infoBox = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  p: { xs: 2, sm: 2.5 },
  borderRadius: '16px',
  bgcolor: 'background.paper',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(0,0,0,0.08)',
});

// Premium info icon box styling
export const infoIconBox = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.primary.main,
  borderRadius: '12px',
  width: 44,
  height: 44,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(99,102,241,0.3)'
    : '0 4px 12px rgba(99,102,241,0.25)',
  flexShrink: 0,
});

// Premium info icon styling
export const infoIconStyle: CSSProperties = {
  color: '#fff',
  zIndex: 1,
};

// Premium info title styling
export const infoTitle = (theme: Theme) => ({
  fontWeight: 700,
  fontSize: { xs: '0.95rem', sm: '1rem' },
  letterSpacing: '-0.01em',
  color: theme.palette.text.primary,
  mb: 0.5,
});

// Premium info description styling
export const infoDesc = (theme: Theme) => ({
  fontWeight: 400,
  fontSize: { xs: '0.825rem', sm: '0.875rem' },
  lineHeight: 1.5,
  color: theme.palette.text.secondary,
  letterSpacing: '-0.005em',
});

// Premium actions box styling
export const actionsBox = (theme: Theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  pt: 3,
  borderTop: theme.palette.mode === 'dark'
    ? '1px solid rgba(255,255,255,0.06)'
    : '1px solid rgba(0,0,0,0.06)',
});

// Premium close button styling
export const closeButtonSx = (theme: Theme) => ({
  minWidth: 120,
  py: 1.75,
  px: 3,
  fontWeight: 600,
  fontSize: '0.95rem',
  letterSpacing: '0.01em',
  borderRadius: '14px',
  textTransform: 'none',
  border: theme.palette.mode === 'dark'
    ? '1.5px solid rgba(255,255,255,0.12)'
    : '1.5px solid rgba(0,0,0,0.08)',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(45,45,55,0.7)'
    : 'rgba(255,255,255,0.8)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(55,55,65,0.8)'
      : 'rgba(255,255,255,0.95)',
    borderColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.18)'
      : 'rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 16px rgba(0,0,0,0.3)'
      : '0 6px 16px rgba(0,0,0,0.1)',
    color: theme.palette.text.primary,
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

export const summaryDialogPaperSx = {
  minWidth: { xs: "90vw", sm: 550, md: 600 },
  maxWidth: { xs: "98vw", sm: 600 },
};