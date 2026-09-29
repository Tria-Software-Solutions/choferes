import React from "react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";

// Tooltip de datos con el mismo aspecto que el de las gráficas de Reportes
// (superficie de menú, borde de diálogo, sombra de menú). El valor lidera y la
// etiqueta acompaña; también se abre con el foco del teclado.

interface RichTooltipProps {
  title: React.ReactNode;
  children: React.ReactElement;
  placement?: "top" | "bottom";
}

export const RichTooltip: React.FC<RichTooltipProps> = ({ title, children, placement = "top" }) => {
  const { colors, borders, shadows } = useTheme().tokens;
  return (
    <Tooltip
      title={title}
      placement={placement}
      enterTouchDelay={0}
      leaveTouchDelay={2500}
      slotProps={{
        popper: { modifiers: [{ name: "offset", options: { offset: [0, 8] } }] },
        tooltip: {
          sx: {
            backgroundColor: colors.menuSurface,
            color: colors.text,
            border: borders.dialog,
            borderRadius: "10px",
            boxShadow: shadows.menu,
            padding: "8px 10px",
            maxWidth: 260,
            fontSize: 12,
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

interface TooltipRowProps {
  label: string;
  value: React.ReactNode;
  /** Trazo corto de color que identifica la serie. */
  swatch?: string;
}

export const TooltipRow: React.FC<TooltipRowProps> = ({ label, value, swatch }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 150 }}>
      {swatch && (
        <Box aria-hidden sx={{ width: 10, height: 3, borderRadius: 2, backgroundColor: swatch, flexShrink: 0 }} />
      )}
      <Typography component="span" sx={{ fontSize: 12, color: colors.textMuted, flex: 1 }}>
        {label}
      </Typography>
      <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
        {value}
      </Typography>
    </Box>
  );
};

export const TooltipTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme().tokens;
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.text, mb: 0.5 }}>{children}</Typography>
  );
};
