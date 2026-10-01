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
  /** Si se debe mostrar el total de horas al pie (default: true). */
  showTotal?: boolean;
}

/**
 * Semana completa estilo calendario: cabecera Lun..Dom y 7 columnas de día.
 * Ocupa todo el alto del BentoGridItem (flex: 1, minHeight: 0).
 * Cada celda de día crece para rellenar el espacio; si no hay turnos,
 * muestra "Sin asignar" centrado.
 */
export const WeekAgenda: React.FC<WeekAgendaProps> = ({
  days,
  todayIso,
  emptyTitle = "Sin lugares asignados",
  emptyDescription = "Cuando te asignen un horario y lugar de trabajo lo verás aquí.",
  showTotal = true,
}) => {
  const { colors, borders } = useTheme().tokens;

  const assignedDays = days.filter(isAssigned);
  if (assignedDays.length === 0) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <EmptyHint icon={<IconMapPinOff />} title={emptyTitle} description={emptyDescription} />
      </Box>
    );
  }

  const totalHours = days.reduce((sum, day) => sum + day.hours, 0);

  const dayColumns = days.map((day) => {
    const isToday = day.date === todayIso;
    const assigned = isAssigned(day);
    const date = parseISODate(day.date);
    const relative = relativeDayLabel(day.date, todayIso);

    return (
      <Box
        key={day.date}
        aria-label={assigned
          ? `${capitalize(formatLongDate(date))}: ${day.scheduleLabel}, ${formatHours(day.hours)} horas`
          : `${capitalize(formatLongDate(date))}: sin lugar asignado`}
        sx={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          flex: "1 1 0",
          borderRadius: "10px",
          border: `1px solid ${isToday ? colors.accent : colors.border}`,
          backgroundColor: isToday ? colors.accentSoft : colors.surface,
          overflow: "hidden",
        }}
      >
        {/* Cabecera del día */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 0.5,
            p: 0.75,
            borderBottom: borders.hairline,
            backgroundColor: isToday ? colors.accentSoft : "transparent",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: isToday ? colors.accentStrong : colors.textMuted,
              }}
            >
              {SHORT_LABELS[day.day] ?? day.day}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: isToday ? colors.accentStrong : colors.text,
              }}
            >
              {date.getDate()}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.5625rem",
                fontWeight: 600,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: isToday ? colors.accentStrong : colors.textMuted,
                ml: 0.25,
              }}
            >
              {date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase()}
            </Typography>
          </Box>
          {relative === "Hoy" && (
            <Typography
              sx={{
                fontSize: "0.5625rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: colors.accentStrong,
                whiteSpace: "nowrap",
              }}
            >
              Hoy
            </Typography>
          )}
        </Box>

        {/* Contenido del día: lugar arriba, horas abajo a la derecha */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 1,
            minHeight: 0,
          }}
        >
          {assigned ? (
            <>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: colors.text,
                  lineHeight: 1.3,
                  overflowWrap: "anywhere",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {day.scheduleLabel}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 0.25,
                  color: colors.textSubtle,
                  pt: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    lineHeight: 1,
                    color: colors.textSubtle,
                  }}
                >
                  {formatHours(day.hours)} h
                </Typography>
              </Box>
            </>
          ) : (
            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 400,
                color: colors.textSubtle,
              }}
            >
              Sin asignar
            </Typography>
          )}
        </Box>
      </Box>
    );
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* 7 columnas de día */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {dayColumns}
      </Box>

      {/* Pie: total horas */}
      {showTotal && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            pt: 1,
            px: 0.5,
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: colors.textMuted }}>
            {assignedDays.length} {assignedDays.length === 1 ? "día" : "días"} con turno
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: colors.text }}>
            {formatHours(totalHours)} h
          </Typography>
        </Box>
      )}
    </Box>
  );
};