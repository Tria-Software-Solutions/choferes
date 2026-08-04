import { SxProps, Theme } from "@mui/material";

export const dockContainerStyles = (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
  px: { xs: 0.75, sm: 1 },
  py: 1.75,
  borderRadius: '14px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e23' : '#ffffff',
  border: `1px solid ${
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  }`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 12px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
    : '0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
  minHeight: 56,
  overflow: 'visible',
  transition: 'all 0.2s ease',
});

// Container variant while in edit mode — no border, no shadow, just extra padding
export const dockEditContainerStyles = (_theme: Theme) => ({
  border: 'none',
  boxShadow: 'none',
  pt: 1.25,
  px: { xs: 0.75, sm: 1 },
  pb: 1.25,
});

export const dockItemsRowStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: { xs: 0.5, sm: 1 },
  position: 'relative', // so absolute drop overlays anchor to the items row
};

export const dockIconRootStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
};

// Edit mode header (title + hint)
export const dockEditHeaderStyles = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  gap: 0.5,
  mb: 2.5,
  pb: 1,
  width: '100%',
  borderBottom: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.07)'
      : 'rgba(0,0,0,0.07)'
  }`,
});

export const dockEditTitleStyles = (theme: Theme) => ({
  fontWeight: 700,
  fontSize: '0.82rem',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.55)'
    : 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
});

export const dockEditHintStyles = (theme: Theme) => ({
  fontSize: '0.66rem',
  fontWeight: 500,
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.28)'
    : 'rgba(0,0,0,0.28)',
  textAlign: 'center',
});

// Edit mode: each item gets vertical layout (icon + label + switch)
export const dockItemEditWrapperStyles = (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.4,
  position: 'relative',
  px: 0.75,
  py: 0.5,
  borderRadius: '12px',
  transition: 'background-color 0.15s ease, opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.03)',
  },
  // Highlight when a drag is hovering over this item as a drop target
  '&.is-drop-target': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(129,140,248,0.16)'
      : 'rgba(99,102,241,0.1)',
    boxShadow: `inset 0 0 0 1.5px ${
      theme.palette.mode === 'dark'
        ? 'rgba(129,140,248,0.5)'
        : 'rgba(99,102,241,0.45)'
    }`,
  },
});

// Staggered entrance animation for items when entering edit mode.
// Only transforms are animated so hidden items keep their inline opacity.
export const dockItemEditEntranceStyles: SxProps<Theme> = {
  animation: 'dockItemIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
  '@keyframes dockItemIn': {
    from: { transform: 'translateY(6px) scale(0.96)' },
    to: { transform: 'translateY(0) scale(1)' },
  },
};

// Label shown under each icon in edit mode
export const dockItemLabelStyles = (theme: Theme) => ({
  fontSize: '0.6rem',
  fontWeight: 600,
  lineHeight: 1.15,
  textAlign: 'center',
  maxWidth: 56,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.45)'
    : 'rgba(0,0,0,0.45)',
});

// Drag handle for reordering in edit mode — plain icon (no badge/pill), hugs the item below
export const dockDragHandleStyles = (theme: Theme) => ({
  position: 'absolute',
  top: -9,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.3)'
    : 'rgba(0,0,0,0.25)',
  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  zIndex: 2,
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateX(-50%) scale(1.2)',
  },
  '&:active': {
    cursor: 'grabbing',
    transform: 'translateX(-50%) scale(0.92)',
    color: theme.palette.primary.main,
  },
});

// Item wrapper when being dragged
export const dockItemDraggingStyles = (theme: Theme) => ({
  opacity: 0.35,
  transform: 'scale(0.92)',
  filter: 'grayscale(0.5)',
  transition: 'all 0.15s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 24px rgba(0,0,0,0.4)'
    : '0 8px 24px rgba(0,0,0,0.12)',
});

// Drop indicator (shown between items during drag)
export const dockDropIndicatorStyles = (theme: Theme) => ({
  width: 4,
  height: 52,
  borderRadius: 4,
  background: 'linear-gradient(180deg, #818cf8, #6366f1)',
  flexShrink: 0,
  opacity: 0.95,
  transition: 'all 0.2s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 0 12px rgba(99,102,241,0.5)'
    : '0 0 12px rgba(99,102,241,0.3)',
});

// Subtle tick shown in the empty start/end drop zones (edit mode)
export const dockEndZoneTickStyles = (theme: Theme) => ({
  width: 2,
  height: 28,
  borderRadius: 2,
  background: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.15)'
    : 'rgba(0,0,0,0.12)',
});

// Switch in edit mode (dimmed when the item is hidden).
// Kept at full size so it stays an easy touch target.
export const dockItemSwitchStyles = (_theme: Theme) => ({
  transition: 'opacity 0.2s ease',
});

// Edit mode footer bar
export const dockEditFooterStyles = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  mt: 1.25,
  pt: 1,
  px: 0.5,
  borderTop: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.08)'
  }`,
});

export const dockEditHiddenCountStyles = (theme: Theme) => ({
  fontSize: '0.66rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.35)'
    : 'rgba(0,0,0,0.35)',
  px: 0.75,
  py: 0.25,
  borderRadius: '99px',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(0,0,0,0.04)',
});

export const dockEditActionsStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
};

// Reset button — standard text button, compact, no border
// (follows the theme's text button styling)
export const dockEditResetBtnStyles = (theme: Theme) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.7rem',
  color: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.55)'
    : 'rgba(0,0,0,0.55)',
  borderRadius: '12px',
  px: 1.5,
  py: 0.4,
  minWidth: 0,
  minHeight: 0,
  lineHeight: 1.3,
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.05)',
    color: theme.palette.text.primary,
  },
});

// Done button — standard contained button (theme primary), compact size, no shadow
export const dockEditDoneBtnStyles = (theme: Theme) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.7rem',
  borderRadius: '12px',
  px: 2,
  py: 0.4,
  minWidth: 0,
  minHeight: 0,
  lineHeight: 1.3,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: 'none',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? '#d4d4d4'
      : '#1a1a1a',
    boxShadow: 'none',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: 'none',
  },
});
