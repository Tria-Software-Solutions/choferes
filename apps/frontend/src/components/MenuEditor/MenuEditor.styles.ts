import { SxProps, Theme } from '@mui/material';
import { keyframes } from '@emotion/react';

const slideUpKeyframes = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// Matches the Dock container glassmorphism style exactly
export const editorContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  px: 1.5,
  py: 1.5,
  borderRadius: '16px',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(24, 24, 30, 0.92)'
    : 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(24px) saturate(1.4)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
    : '0 8px 32px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.05)',
  minWidth: 280,
  maxWidth: 400,
  animation: `${slideUpKeyframes} 0.25s cubic-bezier(0.16, 1, 0.3, 1)`,
});

export const editorHeaderStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 1,
  py: 0.75,
  borderBottom: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.06)'
  }`,
  mb: 0.5,
});

export const editorTitleStyles: SxProps<Theme> = (theme) => ({
  fontWeight: 700,
  fontSize: '0.82rem',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.5)'
    : 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
});

export const editorCloseBtnStyles: SxProps<Theme> = (theme) => ({
  width: 28,
  height: 28,
  borderRadius: '8px',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.3)'
    : 'rgba(0,0,0,0.3)',
  transition: 'all 0.15s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.05)',
    color: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.7)'
      : 'rgba(0,0,0,0.7)',
  },
});

// Items are arranged in a row/column similar to Dock items but with text + switch
export const editorItemsRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25,
  px: 0.25,
};

export const editorItemStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1.5,
  px: 1.25,
  py: 1,
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  userSelect: 'none',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.04)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
});

export const editorItemLeftStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  minWidth: 0,
};

// Icon container styled like DockIcon
export const editorItemIconStyles: SxProps<Theme> = (theme) => ({
  width: 32,
  height: 32,
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(0,0,0,0.03)',
  color: theme.palette.primary.main,
  flexShrink: 0,
  fontSize: '1rem',
});

export const editorItemLabelStyles: SxProps<Theme> = (theme) => ({
  fontWeight: 600,
  fontSize: '0.85rem',
  color: theme.palette.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const editorItemSwitchStyles: SxProps<Theme> = {
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      '& + .MuiSwitch-track': {
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  '& .MuiSwitch-sizeSmall': {
    padding: '6px',
  },
};

export const editorFooterStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 1,
  py: 0.75,
  mt: 0.5,
  borderTop: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.06)'
  }`,
});

export const editorHiddenCountStyles: SxProps<Theme> = (theme) => ({
  fontSize: '0.7rem',
  fontWeight: 500,
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.35)'
    : 'rgba(0,0,0,0.35)',
});

export const editorResetBtnStyles: SxProps<Theme> = (theme) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.75rem',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.4)'
    : 'rgba(0,0,0,0.4)',
  borderRadius: '8px',
  px: 1.5,
  py: 0.4,
  minWidth: 0,
  minHeight: 0,
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.04)',
    color: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.7)'
      : 'rgba(0,0,0,0.7)',
  },
});

export const editorDoneBtnStyles: SxProps<Theme> = (theme) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.75rem',
  borderRadius: '8px',
  px: 2,
  py: 0.4,
  minWidth: 0,
  minHeight: 0,
  background: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.1)'
    : theme.palette.primary.main,
  color: '#ffffff',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.18)'
      : theme.palette.primary.dark,
  },
});
