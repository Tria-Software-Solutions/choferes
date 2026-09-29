import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import type { Vacation } from "../../../models/Vacation";
import { capitalize, formatDateRange, monthName, parseISODate } from "../panelModel";
import { RichTooltip, TooltipRow, TooltipTitle } from "./RichTooltip";

interface YearTimelineProps {
  vacations: Vacation[];
  year: number;
  todayIso: string;
}

const MONTHS = Array.from({ length: 12 }, (_, index) => index);

// El año de un vistazo: una fila por mes con una barra que representa sus días;
// las vacaciones aprobadas (verde) y pendientes (ámbar) se dibujan sobre ella y
// una marca señala el día de hoy. Las filas se reparten el alto disponible.
export const YearTimeline: React.FC<YearTimelineProps> = ({ vacations, year, todayIso }) => {
  const { colors } = useTheme().tokens;
  const today = parseISODate(todayIso);

  const active = vacations.filter((vacation) => vacation.status !== "rejected");
  const legend = [
    { label: "Aprobadas", color: colors.success },
    { label: "Pendientes", color: colors.warning },
  ];

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          flex: 1,
          display: "grid",
          gridAutoRows: "minmax(24px, 1fr)",
          gap: 0.25,
        }}
      >
        {MONTHS.map((month) => {
          const monthStart = new Date(year, month, 1);
          const monthEnd = new Date(year, month + 1, 0);
          const days = monthEnd.getDate();

          const overlaps = active
            .map((vacation) => {
              const from = parseISODate(vacation.startDate);
              const to = parseISODate(vacation.endDate);
              const start = from > monthStart ? from : monthStart;
              const end = to < monthEnd ? to : monthEnd;
              return end >= start ? { vacation, start, end } : null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
          const fullName = capitalize(monthName(month + 1));
          const summary =
            overlaps.length === 0
              ? `${fullName}: sin vacaciones`
              : `${fullName}: ${overlaps
                  .map(({ vacation }) => formatDateRange(vacation.startDate, vacation.endDate))
                  .join(", ")}`;

          return (
            <RichTooltip
              key={month}
              title={
                <Box>
                  <TooltipTitle>{`${fullName} ${year}`}</TooltipTitle>
                  {overlaps.length === 0 ? (
                    <Typography sx={{ fontSize: 12, color: colors.textMuted }}>Sin vacaciones</Typography>
                  ) : (
                    overlaps.map(({ vacation }) => (
                      <TooltipRow
                        key={vacation.id}
                        label={formatDateRange(vacation.startDate, vacation.endDate)}
                        value={vacation.status === "approved" ? "Aprobada" : "Pendiente"}
                        swatch={vacation.status === "approved" ? colors.success : colors.warning}
                      />
                    ))
                  )}
                </Box>
              }
            >
              <Box
                component="li"
                tabIndex={0}
                aria-label={summary}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "34px minmax(0, 1fr)",
                  alignItems: "center",
                  gap: 1,
                  outline: "none",
                  borderRadius: "8px",
                  "&:focus-visible": { boxShadow: `0 0 0 2px ${colors.accent}` },
                }}
              >
                <Typography
                  aria-hidden
                  sx={{
                    fontSize: "0.6875rem",
                    fontWeight: isCurrentMonth ? 700 : 500,
                    color: isCurrentMonth ? colors.text : colors.textMuted,
                  }}
                >
                  {fullName.slice(0, 3)}
                </Typography>
                <Box aria-hidden sx={{ position: "relative", height: 12, borderRadius: 999, backgroundColor: colors.hover }}>
                  {overlaps.map(({ vacation, start, end }) => (
                    <Box
                      key={vacation.id}
                      sx={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `${((start.getDate() - 1) / days) * 100}%`,
                        width: `${((end.getDate() - start.getDate() + 1) / days) * 100}%`,
                        borderRadius: 999,
                        backgroundColor: vacation.status === "approved" ? colors.success : colors.warning,
                      }}
                    />
                  ))}
                  {isCurrentMonth && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -4,
                        bottom: -4,
                        left: `calc(${((today.getDate() - 0.5) / days) * 100}% - 1px)`,
                        width: 2,
                        borderRadius: 1,
                        backgroundColor: colors.text,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </RichTooltip>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.75, mt: 1.5 }}>
        {legend.map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box aria-hidden sx={{ width: 9, height: 9, borderRadius: "3px", backgroundColor: item.color }} />
            <Typography component="span" sx={{ fontSize: "0.6875rem", color: colors.textMuted }}>
              {item.label}
            </Typography>
          </Box>
        ))}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box aria-hidden sx={{ width: 2, height: 11, borderRadius: 1, backgroundColor: colors.text }} />
          <Typography component="span" sx={{ fontSize: "0.6875rem", color: colors.textMuted }}>
            Hoy
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
