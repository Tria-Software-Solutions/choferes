import React from "react";
import { Box, alpha, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useMountedFlag } from "./motion";

export type MeterTone = "accent" | "success" | "warning" | "danger";

const useMeterColors = () => {
  const { colors } = useTheme().tokens;
  return (tone: MeterTone): string =>
    ({ accent: colors.accent, success: colors.success, warning: colors.warning, danger: colors.error })[tone];
};

const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

interface MeterBarProps {
  value: number;
  /** Valor que representa el 100 % (por ejemplo, la jornada ordinaria). */
  max: number;
  tone?: MeterTone;
  /** Lo que exceda `max` se dibuja aparte, en color de aviso. */
  showOverflow?: boolean;
  height?: number;
  /** Nombre accesible del medidor. */
  label: string;
  sx?: SxProps<Theme>;
}

// Medidor horizontal: relleno sobre una pista del mismo tono, más claro. El
// exceso sobre `max` se separa con un corte de 2px para leerse como algo distinto.
export const MeterBar: React.FC<MeterBarProps> = ({
  value,
  max,
  tone = "accent",
  showOverflow = false,
  height = 6,
  label,
  sx,
}) => {
  const { colors } = useTheme().tokens;
  const toneColor = useMeterColors()(tone);
  const ready = useMountedFlag();

  const safeMax = Math.max(max, 0);
  const safeValue = Math.max(value, 0);
  const scale = Math.max(showOverflow ? safeValue : 0, safeMax, 0.0001);
  const basePct = (Math.min(safeValue, safeMax) / scale) * 100;
  const overflowPct = showOverflow && safeValue > safeMax ? ((safeValue - safeMax) / scale) * 100 : 0;

  return (
    <Box
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.min(safeValue, safeMax)}
      sx={[
        {
          display: "flex",
          gap: overflowPct > 0 ? "2px" : 0,
          height,
          borderRadius: 999,
          overflow: "hidden",
          backgroundColor: alpha(toneColor, 0.14),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        sx={{
          width: ready ? `${basePct}%` : 0,
          backgroundColor: toneColor,
          borderRadius: 999,
          transition: `width 800ms ${EASE}`,
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      />
      {overflowPct > 0 && (
        <Box
          sx={{
            width: ready ? `${overflowPct}%` : 0,
            backgroundColor: colors.warning,
            borderRadius: 999,
            transition: `width 800ms ${EASE} 160ms`,
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
        />
      )}
    </Box>
  );
};

interface RingMeterProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  tone?: MeterTone;
  label: string;
  /** Contenido centrado dentro del anillo. */
  children?: React.ReactNode;
}

// Anillo de progreso (un solo valor frente a su tope). Se llena al montarse.
export const RingMeter: React.FC<RingMeterProps> = ({
  value,
  max,
  size = 132,
  stroke = 10,
  tone = "accent",
  label,
  children,
}) => {
  const toneColor = useMeterColors()(tone);
  const ready = useMountedFlag();

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? Math.min(1, Math.max(0, value) / max) : 0;

  return (
    <Box
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={alpha(toneColor, 0.14)}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={ready ? circumference * (1 - fraction) : circumference}
          opacity={fraction === 0 ? 0 : 1}
          style={{ transition: `stroke-dashoffset 900ms ${EASE}` }}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
