import React, { useMemo } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import {
  IconBeach,
  IconCalendarEvent,
  IconCalendarStats,
  IconCheck,
  IconHourglass,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { StatusBadge } from "../../../components/Layout";
import type { StatTone } from "../../../components/Layout";
import { BentoGridItem } from "../../../components/BentoGrid/BentoGrid.component";
import type { Vacation, VacationStatus } from "../../../models/Vacation";
import {
  diffDays,
  formatDateRange,
  formatDaysCount,
  formatHours,
  parseISODate,
  toISODate,
  type LinkedOverview,
} from "../panelModel";
import { fillGridSx, span, stackSx, tabRootSx } from "../ui/layout";
import { RingMeter } from "../ui/Meter";
import { revealSx, useCountUp } from "../ui/motion";
import { YearTimeline } from "../ui/YearTimeline";
import { EmptyHint, ListRow, RowStack, RowText, SoftIcon } from "./panelParts";

const STATUS: Record<VacationStatus, { label: string; tone: StatTone; icon: React.ReactElement }> = {
  pending: { label: "Pendiente", tone: "warning", icon: <IconHourglass /> },
  approved: { label: "Aprobada", tone: "success", icon: <IconCheck /> },
  rejected: { label: "Rechazada", tone: "danger", icon: <IconX /> },
};

const STATUS_ORDER: Record<VacationStatus, number> = { pending: 0, approved: 1, rejected: 2 };

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { colors } = useTheme().tokens;
  return (
    <Box sx={{ textAlign: "center", minWidth: 0 }}>
      <Typography
        sx={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: colors.text, lineHeight: 1.2 }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: colors.textMuted }}>{label}</Typography>
    </Box>
  );
};

const BalanceCard: React.FC<{ overview: LinkedOverview; onRequest: () => void }> = ({ overview, onRequest }) => {
  const { colors, borders } = useTheme().tokens;
  const accrual = overview.vacationAccrual;
  const available = accrual?.availableDays ?? overview.employee.vacationDays ?? 0;
  const accrued = accrual?.accruedDays ?? available;
  const animated = useCountUp(available);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2.25 }}>
      {/* El anillo ocupa el espacio libre; lo demás queda pegado abajo. */}
      <Box sx={{ flex: 1, display: "grid", placeItems: "center", py: 1 }}>
        <RingMeter
          value={available}
          max={accrued > 0 ? accrued : 1}
          size={184}
          stroke={14}
          label={`${formatHours(available)} días de vacaciones disponibles`}
        >
          <Typography
            component="span"
            sx={{ fontSize: "3.25rem", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: colors.text }}
          >
            {formatHours(animated)}
          </Typography>
          <Typography component="span" sx={{ mt: 0.5, fontSize: "0.8125rem", fontWeight: 600, color: colors.textMuted }}>
            {available === 1 ? "día disponible" : "días disponibles"}
          </Typography>
        </RingMeter>
      </Box>

      {accrual && (
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1,
            py: 1.5,
            borderTop: borders.hairline,
            borderBottom: borders.hairline,
          }}
        >
          <Metric label="Acumulados" value={formatHours(accrual.accruedDays)} />
          <Metric label="Gozados" value={formatHours(accrual.takenDays)} />
          <Metric label="Semanas laboradas" value={String(accrual.weeksWorked)} />
        </Box>
      )}

      <Button variant="contained" fullWidth startIcon={<IconPlus size={18} />} onClick={onRequest}>
        Solicitar vacaciones
      </Button>
      <Typography sx={{ fontSize: "0.75rem", color: colors.textMuted, textAlign: "center", maxWidth: 320 }}>
        Las solicitudes quedan pendientes hasta que administración las apruebe.
      </Typography>
    </Box>
  );
};

const relativeStart = (vacation: Vacation, todayIso: string): string => {
  if (vacation.status === "rejected") return "";
  const until = diffDays(todayIso, vacation.startDate);
  if (until > 1) return `Comienza en ${formatDaysCount(until)} · `;
  if (until === 1) return "Comienza mañana · ";
  if (until === 0) return "Comienza hoy · ";
  return "";
};

interface VacationsTabProps {
  overview: LinkedOverview;
  now: Date;
  onRequest: () => void;
}

export const VacationsTab: React.FC<VacationsTabProps> = ({ overview, now, onRequest }) => {
  const todayIso = toISODate(now);

  const requests = useMemo(
    () =>
      [...overview.vacations].sort(
        (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (a.startDate < b.startDate ? 1 : -1),
      ),
    [overview.vacations],
  );

  // El año que se muestra es el de hoy; las solicitudes de otros años no se dibujan.
  const year = parseISODate(todayIso).getFullYear();

  return (
    <Box sx={tabRootSx}>
      <Box sx={fillGridSx}>
        <BentoGridItem
          icon={<IconBeach />}
          title="Mi saldo"
          description="Días disponibles para tomar"
          header={<BalanceCard overview={overview} onRequest={onRequest} />}
          sx={{ ...span(4), ...(revealSx(0) as object) }}
        />

        <Box sx={{ ...(stackSx as object), ...span(8) }}>
          <BentoGridItem
            icon={<IconCalendarEvent />}
            title="Mis solicitudes"
            description={
              requests.length === 0
                ? "Aquí verás el estado de cada solicitud"
                : `${requests.length} ${requests.length === 1 ? "solicitud" : "solicitudes"}`
            }
            header={
              requests.length === 0 ? (
                <EmptyHint
                  icon={<IconBeach />}
                  title="Aún no has solicitado vacaciones"
                  description="Cuando lo hagas, verás aquí el estado de cada solicitud."
                />
              ) : (
                <RowStack>
                  {requests.map((vacation) => {
                    const status = STATUS[vacation.status] ?? STATUS.pending;
                    return (
                      <ListRow key={vacation.id}>
                        <SoftIcon tone={status.tone}>{status.icon}</SoftIcon>
                        <RowText
                          title={formatDateRange(vacation.startDate, vacation.endDate)}
                          subtitle={`${relativeStart(vacation, todayIso)}${formatDaysCount(vacation.daysRequested)}${
                            vacation.reason ? ` · ${vacation.reason}` : ""
                          }`}
                        />
                        <StatusBadge label={status.label} tone={status.tone} size="small" />
                      </ListRow>
                    );
                  })}
                </RowStack>
              )
            }
            sx={revealSx(1) as object}
          />
          <BentoGridItem
            icon={<IconCalendarStats />}
            title={`Mi año ${year}`}
            description="Tus días de vacaciones mes a mes"
            header={<YearTimeline vacations={overview.vacations} year={year} todayIso={todayIso} />}
            sx={{ flex: 1, ...(revealSx(2) as object) }}
          />
        </Box>
      </Box>
    </Box>
  );
};
