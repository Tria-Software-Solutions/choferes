import { SxProps, Theme } from "@mui/material";

export const dockContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  px: 1.5,
  py: 1,
  borderRadius: '16px',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(24, 24, 30, 0.92)'
    : 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(24px) saturate(1.4)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
    : '0 8px 32px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.05)',
  minHeight: 56,
  overflow: 'visible',
});

export const dockIconRootStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
};
