import React from "react";
import { Box, Button, ButtonBase, Typography, useTheme } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useToneColors } from "../../../components/Layout";
import type { StatTone } from "../../../components/Layout";

// Piezas compartidas por las pestañas de "Mi Panel". La tarjeta (borde, radio y
// sombra) la aporta BentoGridItem; estas piezas solo dibujan contenido dentro.

// YYYY-MM-DD → DD/MM/YYYY sin corrimiento de zona horaria.
export const formatDay = (value?: string | null): string => {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

interface SoftIconProps {
  children: React.ReactNode;
  tone?: StatTone;
  size?: number;
  sx?: SxProps<Theme>;
}

/** Ícono dentro de un cuadro redondeado teñido con el tono del estado. */
export const SoftIcon: React.FC<SoftIconProps> = ({ children, tone = "accent", size = 36, sx }) => {
  const toneColors = useToneColors()(tone);
  return (
    <Box
      aria-hidden
      sx={[
        {
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: `${Math.round(size * 0.28)}px`,
          display: "grid",
          placeItems: "center",
          color: toneColors.fg,
          backgroundColor: toneColors.bg,
          "& svg": { width: Math.round(size * 0.5), height: Math.round(size * 0.5), strokeWidth: 1.9 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
};

interface EmptyHintProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  tone?: StatTone;
  action?: React.ReactNode;
}

/** Estado vacío dentro de una tarjeta: ícono, título breve y una línea de contexto. */
export const EmptyHint: React.FC<EmptyHintProps> = ({ icon, title, description, tone = "default", action }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 0.5,
        px: 2,
        py: 3,
        minHeight: 140,
      }}
    >
      {icon && (
        <SoftIcon tone={tone} size={44} sx={{ mb: 0.75 }}>
          {icon}
        </SoftIcon>
      )}
      <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: colors.text }}>{title}</Typography>
      {description && (
        <Typography sx={{ fontSize: "0.8125rem", color: colors.textMuted, maxWidth: 300 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1.25 }}>{action}</Box>}
    </Box>
  );
};

interface ListRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  /** Franja lateral de color (estado de la fila). */
  rail?: string;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
}

/** Fila de lista con el estilo de la app: borde hairline, radio 12 y hover suave. */
export const ListRow: React.FC<ListRowProps> = ({ children, onClick, rail, ariaLabel, sx }) => {
  const { colors, borders } = useTheme().tokens;
  const base = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    width: "100%",
    minWidth: 0,
    p: 1.25,
    pl: rail ? 1.75 : 1.25,
    borderRadius: "12px",
    border: borders.paper,
    textAlign: "left",
    backgroundColor: "transparent",
    transition: "background-color 160ms ease, border-color 160ms ease",
    "&::before": rail
      ? {
          content: '""',
          position: "absolute",
          left: 0,
          top: 10,
          bottom: 10,
          width: 3,
          borderRadius: "0 3px 3px 0",
          backgroundColor: rail,
        }
      : undefined,
    ...(onClick && { cursor: "pointer", "&:hover": { backgroundColor: colors.hoverSoft, borderColor: colors.borderStrong } }),
  } as const;

  if (onClick) {
    return (
      <ButtonBase
        onClick={onClick}
        aria-label={ariaLabel}
        sx={[base, { justifyContent: "flex-start", alignItems: "center", fontFamily: "inherit" }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      >
        {children}
      </ButtonBase>
    );
  }
  return (
    <Box sx={[base, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} aria-label={ariaLabel}>
      {children}
    </Box>
  );
};

interface RowTextProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  subtitleColor?: string;
  /** Permite que el subtítulo ocupe varias líneas en vez de cortarse con elipsis. */
  wrapSubtitle?: boolean;
}

/** Título + subtítulo de una fila, con elipsis. */
export const RowText: React.FC<RowTextProps> = ({ title, subtitle, subtitleColor, wrapSubtitle = false }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        component="div"
        sx={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: colors.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          component="div"
          sx={{
            fontSize: "0.75rem",
            color: subtitleColor ?? colors.textMuted,
            ...(wrapSubtitle
              ? { lineHeight: 1.4 }
              : { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }),
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

/** Pila vertical de filas dentro de una tarjeta. */
export const RowStack: React.FC<{ children: React.ReactNode; sx?: SxProps<Theme> }> = ({ children, sx }) => (
  <Box
    sx={[
      { display: "flex", flexDirection: "column", gap: 1, minHeight: 0 },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  >
    {children}
  </Box>
);

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

/** Dato del expediente: ícono suave, etiqueta pequeña y valor. */
export const Field: React.FC<FieldProps> = ({ icon, label, value }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, py: 0.5 }}>
      <SoftIcon tone="default" size={34}>
        {icon}
      </SoftIcon>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: colors.textMuted,
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
        <Typography
          component="div"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: colors.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

/** Botón de texto discreto para las acciones del encabezado de una tarjeta. */
export const GhostButton: React.FC<ButtonProps> = ({ sx, ...props }) => {
  const { colors } = useTheme().tokens;
  return (
    <Button
      size="small"
      variant="text"
      {...props}
      sx={[
        {
          borderRadius: "10px",
          fontWeight: 600,
          color: colors.textMuted,
          "&:hover": { backgroundColor: colors.hover, color: colors.text },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
};
