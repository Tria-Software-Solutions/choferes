import React from "react";
import { Box, useTheme } from "@mui/material";
import {
  IconArrowRight,
  IconBeach,
  IconCalendarEvent,
  IconCalendarWeek,
  IconClock,
  IconListCheck,
  IconReceipt,
} from "@tabler/icons-react";
import { StatCard } from "../../../components/Layout";
import { BentoGridItem } from "../../../components/BentoGrid/BentoGrid.component";
import { formatColones } from "../../../utils/boletaFormat";
import { PAYMENT_STATUS } from "../../EmployeeDetail/components/PaymentBoletaDialog";
import {
  REGULAR_HOURS,
  biweekShortLabel,
  capitalize,
  formatDateRange,
  formatHours,
  getAttentionItems,
  getShiftFacts,
  latestPayment,
  monthName,
  pendingTasks,
  toISODate,
  trimZeroCents,
  type AttentionItem,
  type LinkedOverview,
  type PanelTabKey,
} from "../panelModel";
import { MeterBar } from "../ui/Meter";
import { revealSx, useCountUp } from "../ui/motion";
import { fillGridSx, span, tabRootSx } from "../ui/layout";
import { WeekAgenda } from "../ui/WeekAgenda";
import { AttentionStrip } from "./AttentionStrip";
import { GhostButton } from "./panelParts";
import { TasksList } from "./TasksList";
import { TodayHero } from "./TodayHero";

const AnimatedValue: React.FC<{ value: number; format?: (value: number) => string }> = ({
  value,
  format = formatHours,
}) => <>{format(useCountUp(value))}</>;

const Unit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box component="span" sx={{ ml: 0.5, fontSize: "0.875rem", fontWeight: 600, color: colors.textMuted }}>
      {children}
    </Box>
  );
};

interface SummaryTabProps {
  overview: LinkedOverview;
  now: Date;
  onOpenTab: (tab: PanelTabKey) => void;
  onNavigate: (to: string) => void;
}

// "Resumen": lo más importante de un vistazo — qué toca hoy, avisos, las cifras
// clave y la semana. El detalle de cada tema vive en las demás pestañas.
export const SummaryTab: React.FC<SummaryTabProps> = ({ overview, now, onOpenTab, onNavigate }) => {
  const todayIso = toISODate(now);
  const shift = getShiftFacts(overview, todayIso);
  const attention = getAttentionItems(overview, todayIso);
  const week = overview.week;

  const accrual = overview.vacationAccrual;
  const available = accrual?.availableDays ?? overview.employee.vacationDays ?? null;
  const biweekly = overview.summaries.biweekly;
  const monthly = overview.summaries.monthly;
  const lastPayment = latestPayment(overview.payments);
  const paymentStatus = lastPayment ? (PAYMENT_STATUS[lastPayment.status] ?? PAYMENT_STATUS.pending) : null;

  const handleAttention = (item: AttentionItem) => {
    if ("tab" in item.target) onOpenTab(item.target.tab);
    else onNavigate(item.target.to);
  };

  const pending = pendingTasks(overview.tasks);
  const overdueCount = pending.filter((task) => task.dueDate && task.dueDate < todayIso).length;
  const tasksDescription =
    pending.length === 0
      ? "Sin pendientes"
      : `${pending.length} ${pending.length === 1 ? "pendiente" : "pendientes"}${
          overdueCount > 0 ? ` · ${overdueCount} ${overdueCount === 1 ? "vencida" : "vencidas"}` : ""
        }`;

  const biweeklyHours = biweekly?.totalHours ?? 0;
  const monthlyHours = monthly?.totalHours ?? 0;

  return (
    <Box sx={tabRootSx}>
      <TodayHero overview={overview} shift={shift} now={now} />

      <AttentionStrip items={attention} onSelect={handleAttention} />

      <BentoGridItem
        icon={<IconCalendarWeek />}
        title="Mi semana"
        description={week ? `Semana ${week.weekNumber} · ${formatDateRange(week.startDate, week.endDate)}` : undefined}
        actions={
          <GhostButton endIcon={<IconArrowRight size={16} />} onClick={() => onOpenTab("horas")}>
            Ver horas
          </GhostButton>
        }
        header={<WeekAgenda days={week?.days ?? []} todayIso={todayIso} />}
        sx={revealSx(2) as object}
      />

      <Box
        sx={{
          display: "grid",
          gap: { xs: 1, sm: 1.25 },
          // 2 columnas en pantallas angostas y 4 desde tablet: nunca queda una tarjeta huérfana.
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        <StatCard
          label="Vacaciones"
          icon={<IconBeach />}
          tone="accent"
          value={
            available != null ? (
              <>
                <AnimatedValue value={available} />
                <Unit>{available === 1 ? "día" : "días"}</Unit>
              </>
            ) : (
              "—"
            )
          }
          hint={accrual ? `disponibles de ${formatHours(accrual.accruedDays)} acumulados` : "disponibles"}
          footer={
            accrual && accrual.accruedDays > 0 ? (
              <MeterBar value={available ?? 0} max={accrual.accruedDays} label="Vacaciones disponibles sobre acumuladas" />
            ) : undefined
          }
          onClick={() => onOpenTab("vacaciones")}
          sx={revealSx(2)}
        />
        <StatCard
          label="Quincena"
          icon={<IconCalendarEvent />}
          value={
            <>
              <AnimatedValue value={biweeklyHours} />
              <Unit>h</Unit>
            </>
          }
          hint={
            biweekly
              ? `${biweekShortLabel(biweekly.biweekNumber, biweekly.year)} · de ${REGULAR_HOURS.biweek} h`
              : "Sin horas registradas"
          }
          footer={
            <MeterBar
              value={biweeklyHours}
              max={REGULAR_HOURS.biweek}
              showOverflow
              label="Horas de la quincena frente a la jornada ordinaria"
            />
          }
          onClick={() => onOpenTab("horas")}
          sx={revealSx(3)}
        />
        <StatCard
          label={capitalize(monthName(monthly ? monthly.month : now.getMonth() + 1))}
          icon={<IconClock />}
          value={
            <>
              <AnimatedValue value={monthlyHours} />
              <Unit>h</Unit>
            </>
          }
          hint={`de ${REGULAR_HOURS.month} h ordinarias`}
          footer={
            <MeterBar
              value={monthlyHours}
              max={REGULAR_HOURS.month}
              showOverflow
              label="Horas del mes frente a la jornada ordinaria"
            />
          }
          onClick={() => onOpenTab("horas")}
          sx={revealSx(4)}
        />
        <StatCard
          label="Último pago"
          icon={<IconReceipt />}
          value={
            lastPayment ? (
              <AnimatedValue
                value={Number(lastPayment.totalPayable) || 0}
                format={(value) => trimZeroCents(formatColones(Math.round(value)))}
              />
            ) : (
              "—"
            )
          }
          hint={
            lastPayment
              ? `${biweekShortLabel(lastPayment.biweekNumber, lastPayment.year)} · ${paymentStatus?.label ?? ""}`
              : "Aún sin boletas"
          }
          onClick={() => onOpenTab("pagos")}
          sx={revealSx(5)}
        />
      </Box>

      <Box sx={fillGridSx}>
        <BentoGridItem
          icon={<IconListCheck />}
          title="Próximas tareas"
          description={tasksDescription}
          actions={
            <GhostButton endIcon={<IconArrowRight size={16} />} onClick={() => onNavigate("/tasks")}>
              Ver todas
            </GhostButton>
          }
          header={<TasksList tasks={overview.tasks} todayIso={todayIso} onOpen={() => onNavigate("/tasks")} />}
          sx={{ ...span(12), ...(revealSx(7) as object) }}
        />
      </Box>
    </Box>
  );
};
