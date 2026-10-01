import React from "react";
import { Box, ButtonBase, Typography, useTheme } from "@mui/material";
import { revealSx } from "../ui/motion";
import { MeterBar } from "../ui/Meter";

export interface KpiCell {
  /** Clave estable; también se usa para el retardo de la entrada escalonada. */
  id: string;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** Barra de progreso opcional bajo la cifra. */
  meter?: { value: number; max: number; showOverflow?: boolean; label: string };
  onSelect?: () => void;
  /** Texto del botón para lectores de pantalla. */
  ariaLabel?: string;
}

interface KpiBandProps {
  cells: KpiCell[];
  /** Retardo de la entrada, para escalonar respecto a las secciones vecinas. */
  revealIndex?: number;
}

const COLUMN_LABELS: Record<string, string> = {
  vacations: "Vacaciones",
  hours: "Horas",
  payments: "Pagos",
  record: "Expediente",
};

/**
 * Las cuatro cifras clave de "Resumen" en una sola banda.
 *
 * Comparte el lenguaje visual de la franja de arriba (una superficie con borde,
 * celdas separadas por hairlines) en vez de cuatro tarjetas sueltas con su propio
 * borde: se lee como una fila de indicadores y no como cuatro cajas competes.
 * Cada celda sigue siendo un botón que lleva a su pestaña.
 */
export const KpiBand: React.FC<KpiBandProps> = ({ cells, revealIndex = 1 }) => {
  const { colors, borders } = useTheme().tokens;

  return (
    <Box
      sx={[
        {
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          borderRadius: "14px",
          border: borders.paper,
          backgroundColor: colors.surface,
          overflow: "hidden",
        },
        revealSx(revealIndex) as object,
      ]}
    >
      {cells.map((cell, index) => {
        const body = (
          <>
            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colors.textMuted,
              }}
            >
              {cell.label}
            </Typography>
            <Typography
              component="p"
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.625rem" },
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                color: colors.text,
                display: "flex",
                alignItems: "baseline",
                gap: 0.35,
                minWidth: 0,
              }}
            >
              {cell.value}
            </Typography>
            {cell.hint && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: colors.textMuted,
                  lineHeight: 1.35,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {cell.hint}
              </Typography>
            )}
            {cell.meter && (
              <Box sx={{ mt: "auto", pt: 0.5 }}>
                <MeterBar
                  value={cell.meter.value}
                  max={cell.meter.max}
                  showOverflow={cell.meter.showOverflow}
                  height={6}
                  label={cell.meter.label}
                />
              </Box>
            )}
          </>
        );

        // La celda es un botón: el separador se dibuja con bordes para que la
        // banda se lea como una sola superficie, no como tarjetas separadas.
        const cellSx = {
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 0.5,
          p: { xs: 1.75, md: 2 },
          textAlign: "left",
          fontFamily: "inherit",
          color: "inherit",
          // xs: dos columnas; md: cuatro. Los bordes siguen a la retícula.
          borderLeft: {
            xs: index % 2 === 1 ? borders.hairline : "none",
            md: index > 0 ? borders.hairline : "none",
          },
          borderTop: { xs: index >= 2 ? borders.hairline : "none", md: "none" },
          ...(cell.onSelect && {
            cursor: "pointer",
            transition: "background-color 160ms ease",
            "&:hover": { backgroundColor: colors.hoverSoft },
            "&:focus-visible": { outline: `2px solid ${colors.accent}`, outlineOffset: -2 },
          }),
        } as const;

        if (!cell.onSelect) {
          return (
            <Box key={cell.id} sx={cellSx}>
              {body}
            </Box>
          );
        }

        return (
          <ButtonBase
            key={cell.id}
            onClick={cell.onSelect}
            aria-label={cell.ariaLabel ?? `${cell.label}. ${COLUMN_LABELS[cell.id] ?? "Ver detalle"}`}
            sx={cellSx}
          >
            {body}
          </ButtonBase>
        );
      })}
    </Box>
  );
};
