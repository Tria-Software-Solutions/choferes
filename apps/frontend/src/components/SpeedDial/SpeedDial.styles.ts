import { SxProps, Theme } from "@mui/material";

export const speedDialStyles: SxProps<Theme> = (theme) => ({
  zIndex: 1000,
  "& .MuiFab-root": {
    width: 36,
    height: 36,
    minHeight: 36,
    borderRadius: "12px",
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.06)',
    color: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.5)'
      : 'rgba(0,0,0,0.4)',
    boxShadow: 'none',
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: 'none',
    "&:hover": {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.15)'
        : 'rgba(0,0,0,0.1)',
      color: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.8)'
        : 'rgba(0,0,0,0.7)',
      transform: "scale(1.08)",
      boxShadow: 'none',
    },
    "&:active": {
      transform: "scale(0.94)",
    },
  },
});

export const speedDialActionStyles: SxProps<Theme> = (theme) => ({
  zIndex: 1001,
  "& .MuiFab-root": {
    width: 36,
    height: 36,
    minHeight: 36,
    borderRadius: "12px",
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.06)',
    color: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.5)'
      : 'rgba(0,0,0,0.4)',
    boxShadow: 'none',
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.15)'
        : 'rgba(0,0,0,0.1)',
      color: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.8)'
        : 'rgba(0,0,0,0.7)',
      transform: "scale(1.12)",
      boxShadow: 'none',
    },
    "&:active": {
      transform: "scale(0.94)",
    },
  },
  "& .MuiSpeedDialAction-tooltip": {
    borderRadius: "10px",
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(30,30,35,0.95)'
      : 'rgba(255,255,255,0.95)',
    color: theme.palette.text.primary,
    fontSize: "0.72rem",
    fontWeight: 600,
    padding: "5px 10px",
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 16px rgba(0,0,0,0.3)'
      : '0 4px 16px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(8px)',
  },
});
