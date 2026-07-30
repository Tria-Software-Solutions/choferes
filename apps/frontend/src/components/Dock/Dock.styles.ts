import { SxProps, Theme } from "@mui/material";

export const dockContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
  px: 1,
  py: 1.75,
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
  transition: 'all 0.2s ease',
});

export const dockItemsRowStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
};

export const dockIconRootStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
};

// Edit mode: each item gets vertical layout (icon + switch)
export const dockItemEditWrapperStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.25,
  position: 'relative',
};

// Drag handle for reordering in edit mode
export const dockDragHandleStyles: SxProps<Theme> = (theme) => ({
  position: 'absolute',
  top: -4,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 28,
  height: 20,
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.25)'
    : 'rgba(0,0,0,0.2)',
  background: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(0,0,0,0.03)',
  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  zIndex: 2,
  '&:hover': {
    color: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.7)'
      : 'rgba(0,0,0,0.6)',
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(0,0,0,0.1)',
    transform: 'translateX(-50%) scale(1.2)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 2px 8px rgba(0,0,0,0.3)'
      : '0 2px 8px rgba(0,0,0,0.08)',
  },
  '&:active': {
    cursor: 'grabbing',
    transform: 'translateX(-50%) scale(0.92)',
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.16)'
      : 'rgba(0,0,0,0.14)',
  },
});

// Item wrapper when being dragged
export const dockItemDraggingStyles: SxProps<Theme> = (theme) => ({
  opacity: 0.4,
  transform: 'scale(0.95)',
  transition: 'all 0.15s ease',
});

// Drop indicator (shown between items during drag)
export const dockDropIndicatorStyles: SxProps<Theme> = (theme) => ({
  width: 4,
  height: 52,
  borderRadius: 4,
  background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  flexShrink: 0,
  opacity: 0.85,
  boxShadow: `0 0 16px ${theme.palette.primary.main}60, 0 0 4px ${theme.palette.primary.main}30`,
  transition: 'all 0.2s ease',
});

export const dockItemSwitchStyles: SxProps<Theme> = {
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      '& + .MuiSwitch-track': {
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
  '& .MuiSwitch-sizeSmall': {
    padding: 4,
  },
};

// Edit mode footer bar
export const dockEditFooterStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  mt: 1.25,
  pt: 1.25,
  px: 0.75,
  borderTop: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.08)'
  }`,
});

export const dockEditHiddenCountStyles: SxProps<Theme> = (theme) => ({
  fontSize: '0.65rem',
  fontWeight: 500,
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.3)'
    : 'rgba(0,0,0,0.3)',
});

export const dockEditActionsStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
};

export const dockEditResetBtnStyles: SxProps<Theme> = (theme) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.7rem',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.35)'
    : 'rgba(0,0,0,0.35)',
  borderRadius: '8px',
  px: 1.5,
  py: 0.3,
  minWidth: 0,
  minHeight: 0,
  lineHeight: 1.3,
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.04)',
    color: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.7)'
      : 'rgba(0,0,0,0.7)',
  },
});

export const dockEditDoneBtnStyles: SxProps<Theme> = (theme) => ({
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.7rem',
  borderRadius: '8px',
  px: 2,
  py: 0.3,
  minWidth: 0,
  minHeight: 0,
  lineHeight: 1.3,
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
