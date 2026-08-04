import React, { useRef, useCallback, useState } from 'react';
import { Box, Switch, Typography, Button, useTheme, type SxProps, type Theme } from '@mui/material';
import { RotateCcw, GripVertical } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'motion/react';
import {
  dockContainerStyles,
  dockItemsRowStyles,
  dockIconRootStyles,
  dockItemSwitchStyles,
  dockDragHandleStyles,
  dockDropIndicatorStyles,
  dockEndZoneTickStyles,
  dockEditFooterStyles,
  dockEditHiddenCountStyles,
  dockEditActionsStyles,
  dockEditResetBtnStyles,
  dockEditDoneBtnStyles,
} from './Dock.styles';

export interface DockItemData {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface DockProps {
  items: DockItemData[];
  distance?: number;
  baseItemSize?: number;
  magnification?: number;
  spring?: SpringOptions;
  onItemContextMenu?: (item: DockItemData) => void;
  // Edit mode props
  editable?: boolean;
  itemPreferences?: Record<string, boolean>;
  onToggleItem?: (label: string) => void;
  onDone?: () => void;
  onReset?: () => void;
  // Order props
  itemOrder?: string[];
  onMoveItem?: (fromIndex: number, toIndex: number) => void;
}

function DockIcon({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      ...dockIconRootStyles,
      opacity: active ? 1 : 0.6,
      transition: 'opacity 0.2s ease',
      color: active ? theme.palette.primary.main : theme.palette.text.secondary,
      borderRadius: 12,
      backgroundColor: active
        ? (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.06)')
        : 'transparent',
    }}>
      {children}
    </Box>
  );
}

function DockItem({
  children,
  onClick,
  onContextMenu,
  mouseX,
  springOpts,
  distance,
  baseItemSize,
  magnification,
  editable,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  onContextMenu?: () => void;
  mouseX: import('motion/react').MotionValue<number>;
  springOpts: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  editable?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchMovedRef = useRef(false);
  const longPressFired = useRef(false);

  // Only apply magnification when not in edit mode
  const mouseDistance = useTransform(mouseX, (val) => {
    if (editable) return 0; // neutral distance, no magnification
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, springOpts);

  const handleClick = useCallback(() => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (!editable) onClick?.();
  }, [onClick, editable]);

  const handleTouchStart = useCallback(() => {
    touchMovedRef.current = false;
    longPressFired.current = false;
    longPressRef.current = setTimeout(() => {
      if (!touchMovedRef.current && onContextMenu) {
        longPressFired.current = true;
        onContextMenu();
      }
    }, 500);
  }, [onContextMenu]);

  const handleTouchMove = useCallback(() => {
    touchMovedRef.current = true;
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu();
    }
  }, [onContextMenu]);

  return (
    <motion.div
      ref={ref}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="button"
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        cursor: editable ? 'default' : 'pointer',
        outline: 'none',
        border: 'none',
        background: 'transparent',
        position: 'relative',
      }}
    >
      {children}
    </motion.div>
  );
}

export default function Dock({
  items,
  distance = 150,
  baseItemSize = 44,
  magnification = 58,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  onItemContextMenu,
  editable = false,
  itemPreferences = {},
  onToggleItem,
  onDone,
  onReset,
  itemOrder,
  onMoveItem,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Sort items by itemOrder whenever provided so external reordering
  // (e.g. from Profile > Quick Access) is reflected immediately
  const sortedItems = itemOrder
    ? [...items].sort((a, b) => {
        const ai = itemOrder.indexOf(a.label);
        const bi = itemOrder.indexOf(b.label);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
    : items;

  if (sortedItems.length === 0) {
    return (
      <Box sx={dockContainerStyles}>
        <Box sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.85rem', textAlign: 'center' }}>
          No hay enlaces disponibles
        </Box>
      </Box>
    );
  }

  const visibleCount = sortedItems.filter(item => itemPreferences[item.label] !== false).length;
  const hiddenCount = sortedItems.length - visibleCount;

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDragIndex(index);
  };

  const handleDragOver = (index: number | 'end') => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetIndex = index === 'end' ? sortedItems.length : index;
    if (targetIndex !== dragIndex) {
      setDropIndex(targetIndex);
    } else {
      setDropIndex(null);
    }
  };

  const handleDragLeave = () => {
    // Don't clear dropIndex here - let dragOver and dragEnd manage it
  };

  const handleDrop = (toIndex: number | 'end') => (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const targetIndex = toIndex === 'end' ? sortedItems.length : toIndex;
    if (!isNaN(fromIndex) && fromIndex !== targetIndex && onMoveItem) {
      onMoveItem(fromIndex, targetIndex);
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const renderItems = () => {
    const result: React.ReactNode[] = [];

    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const isVisible = itemPreferences[item.label] !== false;
      const isDragging = dragIndex === i;

      result.push(
        <Box
          key={`${item.label}-${i}`}
          sx={(editable ? {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            position: 'relative',
            opacity: isDragging ? 0.3 : 1,
            transform: isDragging ? 'scale(0.88)' : 'none',
            transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: isDragging ? 'grayscale(0.6) brightness(0.8)' : 'none',
          } : {}) as SxProps<Theme>}
          draggable={editable}
          onDragStart={editable ? handleDragStart(i) : undefined}
          onDragOver={editable ? handleDragOver(i) : undefined}
          onDragLeave={editable ? handleDragLeave : undefined}
          onDrop={editable ? handleDrop(i) : undefined}
          onDragEnd={editable ? handleDragEnd : undefined}
        >
          {/* Drag handle - only in edit mode */}
          {editable && (
            <Box sx={dockDragHandleStyles}>
              <GripVertical size={10} strokeWidth={2} />
            </Box>
          )}

          <DockItem
            onClick={item.onClick}
            onContextMenu={onItemContextMenu ? () => onItemContextMenu(item) : undefined}
            mouseX={mouseX}
            springOpts={spring}
            distance={distance}
            baseItemSize={baseItemSize}
            magnification={magnification}
            editable={editable}
          >
            <DockIcon active={item.active}>
              {item.icon}
            </DockIcon>
          </DockItem>

          {/* Switch shown in edit mode */}
          {editable && (
            <Switch
              checked={isVisible}
              onChange={() => onToggleItem?.(item.label)}
              sx={{
                ...dockItemSwitchStyles,
                opacity: isVisible ? 1 : 0.5,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Box>
      );

      // Drop indicator between items (before the next one).
      // The end position (dropIndex === sortedItems.length) is owned by the end overlay.
      if (
        editable &&
        dropIndex === i + 1 &&
        dropIndex < sortedItems.length &&
        dragIndex !== null &&
        dragIndex !== i + 1
      ) {
        result.push(
          <Box key={`drop-${i + 1}`} sx={dockDropIndicatorStyles} />
        );
      }
    }

    return result;
  };

  return (
    <Box
      component={motion.div}
      onMouseMove={(e: React.MouseEvent) => {
        if (editable) return; // no magnification in edit mode
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
      }}
      onMouseLeave={() => mouseX.set(Infinity)}
      sx={dockContainerStyles}
      role="toolbar"
      aria-label="Navigation dock"
    >
      {/* Items row */}
      <Box sx={dockItemsRowStyles}>
        {renderItems()}

        {/* Start drop zone — absolute overlay so the items stay centered in edit mode */}
        {editable && (
          <Box
            onDragOver={handleDragOver(0)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop(0)}
            sx={{
              position: 'absolute',
              top: 0,
              left: -20,
              width: 40,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity:
                dragIndex === null
                  ? 0
                  : dropIndex === 0
                    ? 1
                    : 0.5,
              transition: 'opacity 0.15s ease',
              pointerEvents: dragIndex === null ? 'none' : 'auto',
            }}
          >
            {dropIndex === 0 && dragIndex !== null ? (
              <Box sx={dockDropIndicatorStyles} />
            ) : (
              <Box sx={dockEndZoneTickStyles} />
            )}
          </Box>
        )}

        {/* End drop zone — absolute overlay so the items stay centered in edit mode */}
        {editable && (
          <Box
            onDragOver={handleDragOver('end')}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop('end')}
            sx={{
              position: 'absolute',
              top: 0,
              right: -20,
              width: 40,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity:
                dragIndex === null
                  ? 0
                  : dropIndex === sortedItems.length
                    ? 1
                    : 0.5,
              transition: 'opacity 0.15s ease',
              pointerEvents: dragIndex === null ? 'none' : 'auto',
            }}
          >
            {dropIndex === sortedItems.length && dragIndex !== null ? (
              <Box sx={dockDropIndicatorStyles} />
            ) : (
              <Box sx={dockEndZoneTickStyles} />
            )}
          </Box>
        )}
      </Box>

      {/* Edit mode footer */}
      {editable && (
        <Box sx={dockEditFooterStyles}>
          <Typography sx={dockEditHiddenCountStyles}>
            {hiddenCount > 0
              ? `${hiddenCount} ${hiddenCount === 1 ? 'oculto' : 'ocultos'}`
              : 'Todos visibles'}
          </Typography>
          <Box sx={dockEditActionsStyles}>
            <Button
              startIcon={<RotateCcw size={11} strokeWidth={2} />}
              onClick={onReset}
              sx={dockEditResetBtnStyles}
            >
              Restaurar
            </Button>
            <Button onClick={onDone} sx={dockEditDoneBtnStyles}>
              Hecho
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
