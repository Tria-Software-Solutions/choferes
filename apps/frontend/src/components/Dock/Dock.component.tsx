import React, { useRef } from 'react';
import { Box } from '@mui/material';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'motion/react';
import {
  dockContainerStyles,
  dockIconRootStyles,
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
}

function DockIcon({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Box sx={{
      ...dockIconRootStyles,
      opacity: active ? 1 : 0.6,
      transition: 'opacity 0.2s ease',
      color: active ? 'primary.main' : 'text.secondary',
    }}>
      {children}
    </Box>
  );
}

function DockItem({
  children,
  onClick,
  mouseX,
  springOpts,
  distance,
  baseItemSize,
  magnification,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: import('motion/react').MotionValue<number>;
  springOpts: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, springOpts);

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      tabIndex={0}
      role="button"
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        cursor: 'pointer',
        outline: 'none',
        border: 'none',
        background: 'transparent',
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
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  if (items.length === 0) {
    return (
      <Box sx={dockContainerStyles}>
        <Box sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.85rem', textAlign: 'center' }}>
          No hay enlaces disponibles
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      onMouseMove={(e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
      }}
      onMouseLeave={() => mouseX.set(Infinity)}
      sx={dockContainerStyles}
      role="toolbar"
      aria-label="Navigation dock"
    >
      {items.map((item, index) => (
        <DockItem
          key={index}
          onClick={item.onClick}
          mouseX={mouseX}
          springOpts={spring}
          distance={distance}
          baseItemSize={baseItemSize}
          magnification={magnification}
        >
          <DockIcon active={item.active}>
            {item.icon}
          </DockIcon>
        </DockItem>
      ))}
    </Box>
  );
}
