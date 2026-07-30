import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Switch,
  Button,
  Fade,
} from '@mui/material';
import { X, RotateCcw } from 'lucide-react';
import { MenuPreferences } from '../../hooks/useMenuPreferences';
import {
  editorContainerStyles,
  editorHeaderStyles,
  editorTitleStyles,
  editorCloseBtnStyles,
  editorItemsRowStyles,
  editorItemStyles,
  editorItemLeftStyles,
  editorItemIconStyles,
  editorItemLabelStyles,
  editorItemSwitchStyles,
  editorFooterStyles,
  editorHiddenCountStyles,
  editorResetBtnStyles,
  editorDoneBtnStyles,
} from './MenuEditor.styles';

export interface MenuEditorItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuEditorProps {
  open: boolean;
  items: MenuEditorItem[];
  preferences: MenuPreferences;
  onToggle: (key: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const MenuEditor: React.FC<MenuEditorProps> = ({
  open,
  items,
  preferences,
  onToggle,
  onReset,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use rAF to ensure we don't catch the trigger click
    const rafId = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClickOutside);
    });
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  const visibleCount = items.filter(item => preferences[item.key] !== false).length;
  const hiddenCount = items.length - visibleCount;

  return (
    <Fade in={open} timeout={150}>
      <Box
        ref={panelRef}
        sx={editorContainerStyles}
        role="dialog"
        aria-label="Menu editor"
      >
        {/* Header */}
        <Box sx={editorHeaderStyles}>
          <Typography sx={editorTitleStyles}>
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: theme => theme.palette.primary.main,
                display: 'inline-block',
              }}
            />
            Personalizar
          </Typography>
          <IconButton onClick={onClose} sx={editorCloseBtnStyles} size="small">
            <X size={14} strokeWidth={2} />
          </IconButton>
        </Box>

        {/* Items */}
        <Box sx={editorItemsRowStyles}>
          {items.map((item, index) => {
            const isVisible = preferences[item.key] !== false;
            return (
              <Box
                key={item.key}
                sx={{
                  ...editorItemStyles,
                  opacity: isVisible ? 1 : 0.45,
                  animation: `itemFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.035}s both`,
                  '@keyframes itemFadeIn': {
                    from: { opacity: 0, transform: 'translateX(-6px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
                onClick={() => onToggle(item.key)}
              >
                <Box sx={editorItemLeftStyles}>
                  <Box sx={editorItemIconStyles}>
                    {item.icon}
                  </Box>
                  <Typography sx={editorItemLabelStyles}>
                    {item.label}
                  </Typography>
                </Box>
                <Switch
                  checked={isVisible}
                  onChange={() => onToggle(item.key)}
                  size="small"
                  sx={editorItemSwitchStyles}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            );
          })}
        </Box>

        {/* Footer */}
        <Box sx={editorFooterStyles}>
          <Typography sx={editorHiddenCountStyles}>
            {hiddenCount > 0
              ? `${hiddenCount} ${hiddenCount === 1 ? 'oculto' : 'ocultos'}`
              : 'Todos visibles'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              startIcon={<RotateCcw size={12} strokeWidth={2} />}
              onClick={onReset}
              sx={editorResetBtnStyles}
            >
              Restaurar
            </Button>
            <Button onClick={onClose} sx={editorDoneBtnStyles}>
              Hecho
            </Button>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default React.memo(MenuEditor);
