import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { IconMapPin, IconMapPinOff } from "@tabler/icons-react";
import { StatusBadge } from "../../../components/Layout";
import {
  REGULAR_HOURS,
  capitalize,
  formatHours,
  formatLongDate,
  formatWeekdayDate,
  isAssigned,
  type LinkedOverview,
  type ShiftFacts,
} from "../panelModel";
import { MeterBar } from "../ui/Meter";
import { revealSx, useCountUp } from "../ui/motion";

interface TodayHeroProps {
  overview: LinkedOverview;
  shift: ShiftFacts;
  now: Date;
}

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme().tokens;
  return (
    <Typography
      sx={{
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: colors.textMuted,
      }}
    >
      {children}
    </Typography>
  );
};

// Franja principal de "Resumen", compacta y de un vistazo: dónde toca trabajar
// hoy, cuál es el próximo turno y cómo va la semana. En móvil el lugar de hoy
// ocupa el ancho completo y los otros dos datos van lado a lado debajo.
export const TodayHero: React.FC<TodayHeroProps> = ({ overview, shift, now }) => {
  const { colors, borders } = useTheme().tokens;

  const today = shift.today;
  const place = isAssigned(today) ? today.scheduleLabel : null;
  const hasAnyShift = [...(overview.week?.days ?? []), ...(overview.nextWeek?.days ?? [])].some(isAssigned);

  const registered = shift.registeredWeek;
  const animatedHours = useCountUp(registered);
  const overtime = shift.overtimeWeek;

  let headline: string;
  let subline: string;
  if (place && today) {
    headline = place;
    subline = `${formatHours(today.hours)} ${today.hours === 1 ? "hora" : "horas"} hoy`;
  } else if (hasAnyShift) {
    headline = "Hoy no tienes lugar asignado";
    subline = "Tu supervisor aún no te asigna un horario para hoy.";
  } else {
    headline = "Aún no tienes lugares asignados";
    subline = "Cuando te asignen un horario y lugar aparecerá aquí.";
  }

  const Icon = place ? IconMapPin : IconMapPinOff;
  const cellSx = {
    p: { xs: 1.75, md: 2 },
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 0.5,
  } as const;

  return (
    <Box
      sx={[
        {
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)" },
          borderRadius: "14px",
          border: borders.paper,
          backgroundColor: colors.surface,
          overflow: "hidden",
        },
        revealSx(0) as object,
      ]}
    >
      <Box sx={{ ...cellSx, gridColumn: { xs: "1 / -1", md: "auto" }, flexDirection: "row", alignItems: "center", gap: 1.5 }}>
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: "11px",
            display: "grid",
            placeItems: "center",
            backgroundColor: place ? colors.accentSoft : colors.warningSoft,
            color: place ? colors.accent : colors.warning,
            "& svg": { width: 20, height: 20, strokeWidth: 1.9 },
          }}
        >
          <Icon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Eyebrow>
            {place ? "Lugar de hoy" : "Hoy"} · {capitalize(formatLongDate(now))}
          </Eyebrow>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.25rem", md: "1.375rem" },
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              color: colors.text,
              overflowWrap: "anywhere",
            }}
          >
            {headline}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: colors.textMuted }}>{subline}</Typography>
        </Box>
      </Box>

      <Box sx={{ ...cellSx, borderTop: { xs: borders.hairline, md: "none" }, borderLeft: { md: borders.hairline } }}>
        <Eyebrow>Próximo turno</Eyebrow>
        {shift.next ? (
          <>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: colors.text, lineHeight: 1.25 }}>
              {capitalize(formatWeekdayDate(shift.next.date))}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: colors.textMuted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={shift.next.scheduleLabel ?? undefined}
            >
              {shift.next.scheduleLabel} · {formatHours(shift.next.hours)} h
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: "0.875rem", color: colors.textMuted }}>Sin más turnos asignados</Typography>
        )}
      </Box>

      <Box
        sx={{
          ...cellSx,
          borderTop: { xs: borders.hairline, md: "none" },
          borderLeft: borders.hairline,
        }}
      >
        <Eyebrow>Horas de la semana</Eyebrow>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6, flexWrap: "wrap" }}>
          <Typography
            component="span"
            sx={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: colors.text }}
          >
            {formatHours(animatedHours)}
          </Typography>
          <Typography component="span" sx={{ fontSize: "0.9375rem", fontWeight: 700, color: colors.textMuted }}>
            h
          </Typography>
          {overtime > 0 && <StatusBadge label={`+${formatHours(overtime)} h extra`} tone="warning" size="small" />}
        </Box>
        <MeterBar
          value={registered}
          max={REGULAR_HOURS.week}
          showOverflow
          height={6}
          label="Horas de la semana frente a la jornada ordinaria"
        />
        <Typography sx={{ fontSize: "0.75rem", color: colors.textMuted }}>
          de {REGULAR_HOURS.week} h ordinarias
          {shift.shiftDays > 0 && ` · ${shift.shiftDays} ${shift.shiftDays === 1 ? "día" : "días"}`}
        </Typography>
      </Box>
    </Box>
  );
};
