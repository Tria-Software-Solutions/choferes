import React from "react";
import { Box, useTheme } from "@mui/material";
import { IconArrowRight, IconCalendarWeek, IconListCheck } from "@tabler/icons-react";
import { BentoGridItem } from "../../../components/BentoGrid/BentoGrid.component";
import ROUTES from "../../../constants/routes.constants";
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
import { revealSx, useCountUp } from "../ui/motion";
import { fillGridSx, span, tabRootSx } from "../ui/layout";
import { WeekAgenda } from "../ui/WeekAgenda";
import { AttentionStrip } from "./AttentionStrip";
import { GhostButton } from "./panelParts";
import { KpiBand, type KpiCell } from "./KpiBand";
import { TasksList } from "./TasksList";
import { TodayHero } from "./TodayHero";

const AnimatedValue: React.FC<{ value: number; format?: (value: number) => string }> = ({
  value,
  format = formatHours,
}) => <>{format(useCountUp(value))}</>;

const Unit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 600, color: colors.textMuted }}>
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
//
// El orden es deliberado: la franja de hoy y las cuatro cifras van arriba, porque
// son lo que se consulta sin hacer scroll; la semana y las tareas, que son listas
// largas, ocupan el resto.
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

  const kpis: KpiCell[] = [
    {
      id: "vacations",
      label: "Vacaciones",
      value:
        available != null ? (
          <>
            <AnimatedValue value={available} />
            <Unit>{available === 1 ? "día" : "días"}</Unit>
          </>
        ) : (
          "—"
        ),
      hint: accrual ? `disponibles de ${formatHours(accrual.accruedDays)} acumulados` : "disponibles",
      meter:
        accrual && accrual.accruedDays > 0
          ? {
              value: available ?? 0,
              max: accrual.accruedDays,
              label: "Vacaciones disponibles sobre acumuladas",
            }
          : undefined,
      onSelect: () => onOpenTab("vacations"),
      ariaLabel: "Vacaciones. Ir a mis vacaciones",
    },
    {
      id: "hours",
      label: "Quincena",
      value: (
        <>
          <AnimatedValue value={biweeklyHours} />
          <Unit>h</Unit>
        </>
      ),
      hint: biweekly
        ? `${biweekShortLabel(biweekly.biweekNumber, biweekly.year)} · de ${REGULAR_HOURS.biweek} h`
        : "Sin horas registradas",
      meter: {
        value: biweeklyHours,
        max: REGULAR_HOURS.biweek,
        showOverflow: true,
        label: "Horas de la quincena frente a la jornada ordinaria",
      },
      onSelect: () => onOpenTab("hours"),
      ariaLabel: "Horas de la quincena. Ir a mis horas",
    },
    {
      id: "month",
      label: capitalize(monthName(monthly ? monthly.month : now.getMonth() + 1)),
      value: (
        <>
          <AnimatedValue value={monthlyHours} />
          <Unit>h</Unit>
        </>
      ),
      hint: `de ${REGULAR_HOURS.month} h ordinarias`,
      meter: {
        value: monthlyHours,
        max: REGULAR_HOURS.month,
        showOverflow: true,
        label: "Horas del mes frente a la jornada ordinaria",
      },
      onSelect: () => onOpenTab("hours"),
      ariaLabel: "Horas del mes. Ir a mis horas",
    },
    {
      id: "payments",
      label: "Último pago",
      value: lastPayment ? (
        <AnimatedValue
          value={Number(lastPayment.totalPayable) || 0}
          format={(value) => trimZeroCents(formatColones(Math.round(value)))}
        />
      ) : (
        "—"
      ),
      hint: lastPayment
        ? `${biweekShortLabel(lastPayment.biweekNumber, lastPayment.year)} · ${paymentStatus?.label ?? ""}`
        : "Aún sin boletas",
      onSelect: () => onOpenTab("payments"),
      ariaLabel: "Último pago. Ir a mis pagos",
    },
  ];

  return (
    <Box sx={tabRootSx}>
      <TodayHero overview={overview} shift={shift} now={now} />

      <AttentionStrip items={attention} onSelect={handleAttention} />

      <KpiBand cells={kpis} revealIndex={2} />

      <Box sx={fillGridSx}>
        {/* 3/4 para la semana y 1/4 para las tareas: el agenda de siete días
            necesita el ancho para los nombres de los lugares. */}
        <BentoGridItem
          icon={<IconCalendarWeek />}
          title="Mi semana"
          description={week ? `Semana ${week.weekNumber} · ${formatDateRange(week.startDate, week.endDate)}` : undefined}
          actions={
            <GhostButton endIcon={<IconArrowRight size={16} />} onClick={() => onOpenTab("hours")}>
              Ver horas
            </GhostButton>
          }
          header={<WeekAgenda days={week?.days ?? []} todayIso={todayIso} />}
          sx={{ ...span(9), ...(revealSx(3) as object) }}
        />
        <BentoGridItem
          icon={<IconListCheck />}
          title="Próximas tareas"
          description={tasksDescription}
          actions={
            <GhostButton endIcon={<IconArrowRight size={16} />} onClick={() => onNavigate(ROUTES.TASKS)}>
              Ver todas
            </GhostButton>
          }
          header={<TasksList tasks={overview.tasks} todayIso={todayIso} limit={5} onOpen={() => onNavigate(ROUTES.TASKS)} />}
          sx={{ ...span(3), ...(revealSx(4) as object) }}
        />
      </Box>
    </Box>
  );
};
