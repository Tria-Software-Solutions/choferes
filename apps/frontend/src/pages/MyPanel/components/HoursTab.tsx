import React, { useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { IconMapPin, IconTimeline } from "@tabler/icons-react";
import { StatusBadge } from "../../../components/Layout";
import { BentoGridItem } from "../../../components/BentoGrid/BentoGrid.component";
import SegmentedToggle from "../../../components/SegmentedToggle/SegmentedToggle.component";
import {
  REGULAR_HOURS,
  biweekLabel,
  capitalize,
  formatDateRange,
  formatHours,
  getShiftFacts,
  monthName,
  toISODate,
  type LinkedOverview,
} from "../panelModel";
import { TAB_GAP, fillGridSx, span, tabRootSx } from "../ui/layout";
import { RingMeter } from "../ui/Meter";
import { revealSx, useCountUp } from "../ui/motion";
import { WeekAgenda } from "../ui/WeekAgenda";
import { WeeklyHistoryChart } from "./PanelCharts";

// ─── Anillos por período ────────────────────────────────────────────────────

interface PeriodCardProps {
  title: string;
  period: string;
  hours: number;
  regular: number;
  index: number;
}

const PeriodCard: React.FC<PeriodCardProps> = ({ title, period, hours, regular, index }) => {
  const { colors, borders, shadows } = useTheme().tokens;
  const animated = useCountUp(hours);
  const overtime = Math.max(0, hours - regular);
  const percent = regular > 0 ? Math.round((Math.min(hours, regular) / regular) * 100) : 0;

  return (
    <Box
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: 2,
          minWidth: 0,
          p: { xs: 1.75, sm: 2 },
          borderRadius: "14px",
          border: borders.paper,
          backgroundColor: colors.surface,
          boxShadow: `0 1px 2px ${shadows.card}`,
        },
        revealSx(index) as object,
      ]}
    >
      <RingMeter
        value={hours}
        max={regular}
        size={92}
        stroke={9}
        tone={overtime > 0 ? "warning" : "accent"}
        label={`${title}: ${formatHours(hours)} de ${regular} horas ordinarias`}
      >
        <Typography
          component="span"
          sx={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: colors.text }}
        >
          {formatHours(animated)}
        </Typography>
        <Typography component="span" sx={{ fontSize: "0.6875rem", fontWeight: 700, color: colors.textMuted }}>
          horas
        </Typography>
      </RingMeter>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.9375rem", fontWeight: 700, color: colors.text }}>{title}</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: colors.textMuted }}>{period}</Typography>
        <Box sx={{ mt: 0.75, display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: colors.textMuted }}>
            {percent}% de {regular} h
          </Typography>
          {overtime > 0 && <StatusBadge label={`+${formatHours(overtime)} h extra`} tone="warning" size="small" />}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Pestaña ────────────────────────────────────────────────────────────────

type WeekView = "current" | "next";

interface HoursTabProps {
  overview: LinkedOverview;
  now: Date;
}

export const HoursTab: React.FC<HoursTabProps> = ({ overview, now }) => {
  const [weekView, setWeekView] = useState<WeekView>("current");
  const todayIso = toISODate(now);
  const shift = getShiftFacts(overview, todayIso);
  const week = overview.week;
  const biweekly = overview.summaries.biweekly;
  const monthly = overview.summaries.monthly;
  const month = monthly?.month ?? now.getMonth() + 1;
  const monthYear = monthly?.year ?? now.getFullYear();

  const shownWeek = weekView === "next" ? overview.nextWeek : week;

  return (
    <Box sx={tabRootSx}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: TAB_GAP,
        }}
      >
        <PeriodCard
          index={0}
          title={week ? `Semana ${week.weekNumber}` : "Esta semana"}
          period={week ? formatDateRange(week.startDate, week.endDate) : ""}
          hours={shift.registeredWeek}
          regular={REGULAR_HOURS.week}
        />
        <PeriodCard
          index={1}
          title="Quincena"
          period={biweekly ? biweekLabel(biweekly.biweekNumber, biweekly.year) : "Sin horas registradas"}
          hours={biweekly?.totalHours ?? 0}
          regular={REGULAR_HOURS.biweek}
        />
        <PeriodCard
          index={2}
          title={capitalize(monthName(month))}
          period={`${monthYear}`}
          hours={monthly?.totalHours ?? 0}
          regular={REGULAR_HOURS.month}
        />
      </Box>

      <BentoGridItem
        icon={<IconMapPin />}
        title="Mis turnos"
        description={
          shownWeek
            ? `Semana ${shownWeek.weekNumber} · ${formatDateRange(shownWeek.startDate, shownWeek.endDate)}`
            : undefined
        }
        actions={
          <SegmentedToggle<WeekView>
            value={weekView}
            onChange={setWeekView}
            ariaLabel="Semana de turnos"
            options={[
              { value: "current", label: "Esta semana" },
              { value: "next", label: "Próxima" },
            ]}
          />
        }
        header={
          <WeekAgenda
            days={shownWeek?.days ?? []}
            todayIso={todayIso}
            emptyTitle={
              weekView === "next" ? "Aún no hay turnos para la próxima semana" : "Sin lugares asignados esta semana"
            }
            emptyDescription="Cuando tu supervisor te asigne un horario y lugar de trabajo lo verás aquí."
          />
        }
        sx={revealSx(3) as object}
      />

      <Box sx={fillGridSx}>
        <BentoGridItem
          icon={<IconTimeline />}
          title="Evolución semanal"
          description={`Horas por semana · la línea marca la jornada ordinaria de ${REGULAR_HOURS.week} h`}
          header={<WeeklyHistoryChart data={overview.history?.weekly ?? []} />}
          sx={{ ...span(12), ...(revealSx(4) as object) }}
        />
      </Box>
    </Box>
  );
};
