import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MyPanelWeeklyHistoryEntry } from "../../../models/MyPanel";
import type { Payment } from "../../../models/Payment";
import { formatColones } from "../../../utils/boletaFormat";
import { PAYMENT_STATUS } from "../../EmployeeDetail/components/PaymentBoletaDialog";
import { REGULAR_HOURS, biweekLabel, biweekShortLabel, formatHours, trimZeroCents } from "../panelModel";

// Gráficas de Mi Panel (recharts) con las marcas del sistema de diseño: líneas
// de 2px, cuadrícula de hairlines sólidas, punto final con anillo del color de
// la superficie y tooltip con el valor al frente. Cada una trae su tabla
// equivalente oculta para lectores de pantalla.

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

const ChartEmpty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      flex: 1,
      minHeight: 120,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontSize: "0.8125rem",
      color: "text.secondary",
    }}
  >
    {children}
  </Box>
);

const TooltipCard: React.FC<{ title: string; value: string; note?: string }> = ({ title, value, note }) => {
  const { colors, borders, shadows } = useTheme().tokens;
  return (
    <Box
      sx={{
        backgroundColor: colors.menuSurface,
        border: borders.dialog,
        borderRadius: "10px",
        boxShadow: shadows.menu,
        px: 1.25,
        py: 1,
        minWidth: 132,
      }}
    >
      <Typography sx={{ fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>{title}</Typography>
      <Typography
        sx={{ fontSize: 18, color: colors.text, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 }}
      >
        {value}
      </Typography>
      {note && <Typography sx={{ fontSize: 11, color: colors.textMuted }}>{note}</Typography>}
    </Box>
  );
};

// ─── Evolución semanal de horas ─────────────────────────────────────────────

interface HistoryDatum {
  label: string;
  week: number;
  year: number;
  hours: number;
  delta: number | null;
}

interface WeeklyHistoryChartProps {
  data: MyPanelWeeklyHistoryEntry[];
}

// Ocupa el alto que le deje la tarjeta (con un mínimo para que se lea y un
// máximo para que en pantallas muy altas no se estire de forma absurda).
const ChartFrame: React.FC<{ minHeight: number; children: React.ReactNode }> = ({ minHeight, children }) => (
  <Box sx={{ position: "relative", flex: 1, width: "100%", minHeight, maxHeight: 460 }}>
    <Box sx={{ position: "absolute", inset: 0 }}>{children}</Box>
  </Box>
);

export const WeeklyHistoryChart: React.FC<WeeklyHistoryChartProps> = ({ data }) => {
  const { colors } = useTheme().tokens;

  if (!data.length) {
    return <ChartEmpty>Todavía no hay semanas con horas registradas</ChartEmpty>;
  }

  const points: HistoryDatum[] = data.map((entry, index) => ({
    label: `S${entry.weekNumber}`,
    week: entry.weekNumber,
    year: entry.year,
    hours: entry.totalHours,
    delta: index > 0 ? entry.totalHours - data[index - 1].totalHours : null,
  }));
  const last = points[points.length - 1];
  const axisTick = { fontSize: 11, fill: colors.textMuted };
  const peak = Math.max(REGULAR_HOURS.week, ...points.map((point) => point.hours));
  const top = Math.max(60, Math.ceil((peak * 1.12) / 20) * 20);
  const ticks = Array.from({ length: top / 20 + 1 }, (_, index) => index * 20);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ChartFrame minHeight={240}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 18, right: 14, bottom: 0, left: -14 }}>
            <CartesianGrid vertical={false} stroke={colors.borderHairline} />
            <XAxis
              dataKey="label"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={44}
              allowDecimals={false}
              domain={[0, top]}
              ticks={ticks}
            />
            <ReferenceLine
              y={REGULAR_HOURS.week}
              stroke={colors.borderStrong}
              strokeWidth={1}
              label={{
                value: `${REGULAR_HOURS.week} h`,
                position: "insideTopLeft",
                fill: colors.textMuted,
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ stroke: colors.borderStrong, strokeWidth: 1 }}
              content={(props) => {
                const item = props.payload?.[0]?.payload as HistoryDatum | undefined;
                if (!props.active || !item) return null;
                const note =
                  item.delta == null
                    ? undefined
                    : item.delta === 0
                      ? "Igual que la semana anterior"
                      : `${item.delta > 0 ? "+" : "−"}${formatHours(Math.abs(item.delta))} h vs semana anterior`;
                return (
                  <TooltipCard
                    title={`Semana ${item.week} · ${item.year}`}
                    value={`${formatHours(item.hours)} h`}
                    note={note}
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke={colors.accent}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={colors.accent}
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 5, fill: colors.accent, stroke: colors.surface, strokeWidth: 2 }}
              animationDuration={900}
            />
            <ReferenceDot
              x={last.label}
              y={last.hours}
              r={5}
              fill={colors.accent}
              stroke={colors.surface}
              strokeWidth={2}
              ifOverflow="extendDomain"
              label={{
                value: `${formatHours(last.hours)} h`,
                position: "top",
                fill: colors.text,
                fontSize: 12,
                fontWeight: 700,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>
      <Box sx={visuallyHidden}>
        <table>
          <caption>Horas registradas por semana</caption>
          <thead>
            <tr>
              <th>Semana</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={`${point.year}-${point.week}`}>
                <td>{`Semana ${point.week} de ${point.year}`}</td>
                <td>{formatHours(point.hours)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

// ─── Evolución de pagos ─────────────────────────────────────────────────────

interface PaymentDatum {
  key: string;
  label: string;
  period: string;
  amount: number;
  status: string;
  latest: boolean;
}

interface PaymentsChartProps {
  payments: Payment[];
}

// Importe de cada boleta, de la más antigua a la más reciente. Es una sola
// serie: la última boleta lleva el acento y el resto queda en gris de contexto.
export const PaymentsChart: React.FC<PaymentsChartProps> = ({ payments }) => {
  const { colors } = useTheme().tokens;

  const ordered = payments
    .filter((payment) => payment.status !== "cancelled")
    .sort((a, b) => a.year - b.year || a.biweekNumber - b.biweekNumber)
    .slice(-12);

  if (ordered.length < 2) {
    return <ChartEmpty>Cuando tengas más boletas verás aquí su evolución</ChartEmpty>;
  }

  const points: PaymentDatum[] = ordered.map((payment, index) => ({
    key: `${payment.year}-${payment.biweekNumber}`,
    label: biweekShortLabel(payment.biweekNumber),
    period: biweekLabel(payment.biweekNumber, payment.year),
    amount: Number(payment.totalPayable) || 0,
    status: (PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.pending).label,
    latest: index === ordered.length - 1,
  }));
  const axisTick = { fontSize: 11, fill: colors.textMuted };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ChartFrame minHeight={200}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -6 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke={colors.borderHairline} />
            <XAxis
              dataKey="label"
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(value: number) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
              }
            />
            <Tooltip
              cursor={{ fill: colors.hoverSoft }}
              content={(props) => {
                const item = props.payload?.[0]?.payload as PaymentDatum | undefined;
                if (!props.active || !item) return null;
                return (
                  <TooltipCard
                    title={item.period}
                    value={trimZeroCents(formatColones(item.amount))}
                    note={item.status}
                  />
                );
              }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={800}>
              {points.map((point) => (
                <Cell key={point.key} fill={point.latest ? colors.accent : colors.borderStrong} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <Box sx={visuallyHidden}>
        <table>
          <caption>Importe de las boletas</caption>
          <thead>
            <tr>
              <th>Período</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.key}>
                <td>{point.period}</td>
                <td>{trimZeroCents(formatColones(point.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};
