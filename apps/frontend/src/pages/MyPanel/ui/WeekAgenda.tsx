import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { IconMapPinOff } from "@tabler/icons-react";
import type { MyPanelWeekDay } from "../../../models/MyPanel";
import { EmptyHint } from "../components/panelParts";
import {
  capitalize,
  formatHours,
  formatLongDate,
  isAssigned,
  parseISODate,
  relativeDayLabel,
} from "../panelModel";

const SHORT_LABELS: Record<string, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

interface WeekAgendaProps {
  days: MyPanelWeekDay[];
  todayIso: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

// La semana como calendario en una sola fila: una columna por día con la fecha,
// el Horario/Lugar y las horas. Solo neutros y el acento del sistema (hoy va
// tintado). Si no caben las siete columnas (móvil, tarjetas angostas) la fila se
// desplaza en horizontal en vez de apretar los nombres de los lugares.
export const WeekAgenda: React.FC<WeekAgendaProps> = ({
  days,
  todayIso,
  emptyTitle = "Sin lugares asignados",
  emptyDescription = "Cuando te asignen un horario y lugar de trabajo lo verás aquí.",
}) => {
  const { colors, borders } = useTheme().tokens;

  const assignedDays = days.filter(isAssigned);
  if (assignedDays.length === 0) {
    return <EmptyHint icon={<IconMapPinOff />} title={emptyTitle} description={emptyDescription} />;
  }
  const totalHours = days.reduce((sum, day) => sum + day.hours, 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Box sx={{ overflowX: "auto", mx: -0.5, px: 0.5, pb: 0.5 }}>
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            display: "grid",
            gap: 0.75,
            gridTemplateColumns: "repeat(7, minmax(88px, 1fr))",
          }}
        >
          {days.map((day) => {
            const isToday = day.date === todayIso;
            const assigned = isAssigned(day);
            const date = parseISODate(day.date);
            const relative = relativeDayLabel(day.date, todayIso);
            const summary = assigned
              ? `${capitalize(formatLongDate(date))}: ${day.scheduleLabel}, ${formatHours(day.hours)} horas`
              : `${capitalize(formatLongDate(date))}: sin lugar asignado`;

            return (
              <Box
                component="li"
                key={day.date}
                aria-label={summary}
                title={assigned ? (day.scheduleLabel ?? undefined) : undefined}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  minWidth: 0,
                  minHeight: 116,
                  p: 1,
                  borderRadius: "12px",
                  border: `1px solid ${isToday ? colors.accent : colors.border}`,
                  backgroundColor: isToday ? colors.accentSoft : "transparent",
                }}
              >
                <Box aria-hidden sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: isToday ? colors.accentStrong : colors.textMuted,
                    }}
                  >
                    {SHORT_LABELS[day.day] ?? day.day}
                  </Typography>
                  <Typography component="span" sx={{ fontSize: "1.125rem", fontWeight: 800, letterSpacing: "-0.02em", color: colors.text }}>
                    {date.getDate()}
                  </Typography>
                </Box>
                <Typography
                  aria-hidden
                  sx={{
                    minHeight: 14,
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: isToday ? colors.accentStrong : colors.textMuted,
                  }}
                >
                  {relative === "Hoy" || relative === "Mañana" ? relative : ""}
                </Typography>
                <Typography
                  aria-hidden
                  sx={{
                    flex: 1,
                    fontSize: "0.8125rem",
                    fontWeight: assigned ? 600 : 400,
                    lineHeight: 1.3,
                    color: assigned ? colors.text : colors.textSubtle,
                    overflowWrap: "anywhere",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {assigned ? day.scheduleLabel : "Sin asignar"}
                </Typography>
                <Typography
                  aria-hidden
                  sx={{ fontSize: "0.8125rem", fontWeight: 700, color: assigned ? colors.text : colors.textSubtle }}
                >
                  {assigned ? `${formatHours(day.hours)} h` : "—"}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", pt: 1, borderTop: borders.hairline }}
      >
        <Typography sx={{ fontSize: "0.75rem", color: colors.textMuted }}>
          {assignedDays.length} {assignedDays.length === 1 ? "día" : "días"} con turno
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: colors.text }}>
          Total {formatHours(totalHours)} h
        </Typography>
      </Box>
    </Box>
  );
};
