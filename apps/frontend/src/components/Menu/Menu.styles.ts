import { SxProps, Theme } from "@mui/material";

export const iconButtonStyles: SxProps<Theme> = {
  color: "#ffffff",
  transition: "all 0.2s ease",
  "&:hover": {
    color: "rgba(255,255,255,0.7)",
  },
};

export const textButtonStyles = (theme: Theme): SxProps<Theme> => ({
  height: "40px",
  color: theme.palette.primary.contrastText,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: "translateY(-1px)",
  },
});

export const buttonStyles = (theme: Theme): SxProps<Theme> => ({
  height: "40px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateY(-1px)",
  },
});

export const menuPaperStyles = (theme: Theme): SxProps<Theme> => ({
  width: 380,
  maxHeight: 580,
  mt: 0.5,
  background: theme.palette.mode === 'dark'
    ? 'rgba(30,30,35,0.95)'
    : '#ffffff',
  backdropFilter: 'blur(20px)',
  border: 'none',
  borderRadius: '16px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)'
    : '0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  padding: 0,
});

export const menuItemStyles: SxProps<Theme> = (theme) => ({
  py: 1,
  px: 1.5,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? "rgba(255,255,255,0.08)"
      : theme.palette.action.hover,
    transform: "translateX(2px)",
  },
  '& .MuiListItemIcon-root': {
    minWidth: 32,
    color: theme.palette.primary.main,
  },
});

export const listItemTextStyles: SxProps<Theme> = {
  fontWeight: 500,
  fontSize: "0.875rem",
};

export const subMenuPaperStyles = (theme: Theme): SxProps<Theme> => ({
  width: 380,
  maxHeight: 580,
  mt: 0.5,
  background: theme.palette.mode === 'dark'
    ? 'rgba(30,30,35,0.95)'
    : '#ffffff',
  backdropFilter: 'blur(20px)',
  border: 'none',
  borderRadius: '16px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)'
    : '0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  padding: 0,
});
