import React from "react";
import { useTheme, Box, Typography } from "@mui/material";
import { IconBolt, IconCalculator, IconClock, IconUserExclamation, IconUsers } from "@tabler/icons-react";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { StatCard, StatGrid } from "../../../../components/Layout";
import { getChartPalette } from "../../../../theme/chartPalette";

// ─── Shared pieces ───────────────────────────────────────────────────────────

const ChartEmpty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      flex: 1,
      minHeight: 96,
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

const useTooltipStyle = () => {
  const { colors, borders, shadows } = useTheme().tokens;
  return {
    contentStyle: {
      backgroundColor: colors.menuSurface,
      border: borders.dialog,
      borderRadius: 10,
      boxShadow: shadows.menu,
      fontSize: 12,
      color: colors.text,
      padding: "8px 10px",
    },
    itemStyle: { color: colors.text },
    labelStyle: { color: colors.textMuted, marginBottom: 2 },
  };
};

interface RankedItem {
  name: string;
  value: number;
}

// Ranked list with thin proportional bars: one hue, value on the right.
const RankedBarList: React.FC<{
  data: RankedItem[];
  color: string;
  format: (value: number) => string;
  showRank?: boolean;
}> = ({ data, color, format, showRank = true }) => {
  const { colors } = useTheme().tokens;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, overflow: "auto", flex: 1, minHeight: 0, pr: 0.5 }}>
      {data.map((item, i) => (
        <Box key={`${item.name}-${i}`}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, mb: 0.5 }}>
            <Typography
              component="span"
              sx={{ fontSize: "0.8125rem", fontWeight: 500, color: colors.text, minWidth: 0 }}
              noWrap
            >
              {showRank && (
                <Box component="span" sx={{ color: colors.textSubtle, mr: 0.75, fontVariantNumeric: "tabular-nums" }}>
                  {i + 1}
                </Box>
              )}
              {item.name}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: "0.8125rem", fontWeight: 700, color: colors.text, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
            >
              {format(item.value)}
            </Typography>
          </Box>
          <Box sx={{ height: 6, borderRadius: 999, backgroundColor: colors.hover, overflow: "hidden" }}>
            <Box
              sx={{
                height: "100%",
                width: `${Math.max(2, Math.round((item.value / maxVal) * 100))}%`,
                borderRadius: 999,
                backgroundColor: color,
                opacity: Math.max(0.45, 1 - i * 0.06),
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// ─── Charts ──────────────────────────────────────────────────────────────────

interface TopEmployeesProps {
  data: { name: string; hours: number }[];
}

export const TopEmployeesChart = ({ data }: TopEmployeesProps) => {
  const { colors } = useTheme().tokens;
  if (!data.length) return <ChartEmpty>Sin horas registradas en este período</ChartEmpty>;
  return (
    <RankedBarList
      data={data.slice(0, 10).map((d) => ({ name: d.name, value: d.hours }))}
      color={colors.accent}
      format={(v) => `${v} h`}
    />
  );
};

interface VehicleBrandProps {
  data: { brand: string; count: number }[];
}

export const VehicleBrandChart = ({ data }: VehicleBrandProps) => {
  const theme = useTheme();
  const { colors } = theme.tokens;
  const palette = getChartPalette(theme.palette.mode);
  const tooltip = useTooltipStyle();

  if (!data.length) return <ChartEmpty>Sin vehículos registrados</ChartEmpty>;

  const items = data.slice(0, 8);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2, minHeight: 0 }}>
      <Box sx={{ position: "relative", width: "45%", maxWidth: 150, aspectRatio: "1", flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="count"
              nameKey="brand"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
            >
              {items.map((item, i) => (
                <Cell key={item.brand} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              {...tooltip}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [`${value} vehículos`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, lineHeight: 1, color: colors.text }}>{total}</Typography>
          <Typography sx={{ fontSize: "0.6875rem", color: colors.textMuted }}>total</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75, maxHeight: "100%", overflowY: "auto" }}>
        {items.map((item, i) => (
          <Box key={item.brand} sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "3px", backgroundColor: palette[i % palette.length], flexShrink: 0 }} />
            <Typography component="span" noWrap sx={{ fontSize: "0.8125rem", color: colors.text, flex: 1, minWidth: 0 }}>
              {item.brand}
            </Typography>
            <Typography component="span" sx={{ fontSize: "0.8125rem", fontWeight: 600, color: colors.textMuted, fontVariantNumeric: "tabular-nums" }}>
              {item.count}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface DailyAttendanceProps {
  data: { day: string; count: number }[];
}

export const DailyAttendanceChart = ({ data }: DailyAttendanceProps) => {
  const { colors } = useTheme().tokens;
  const tooltip = useTooltipStyle();
  const daysOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const ordered = daysOrder.map((d) => data.find((x) => x.day === d) || { day: d, count: 0 });

  if (!data.length) return <ChartEmpty>Sin datos de asistencia</ChartEmpty>;

  return (
    <Box sx={{ flex: 1, width: "100%", minHeight: 150 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={ordered} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.borderHairline} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: colors.textMuted }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            {...tooltip}
            cursor={{ stroke: colors.borderStrong }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} empleados`, "Asistencia"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={colors.accent}
            strokeWidth={2}
            fill="url(#attendanceFill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: colors.accent }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface ScheduleDistributionProps {
  data: { label: string; count: number }[];
}

export const ScheduleDistributionChart = ({ data }: ScheduleDistributionProps) => {
  const { colors } = useTheme().tokens;
  if (!data.length) return <ChartEmpty>Sin datos de horarios</ChartEmpty>;
  const sorted = [...data].sort((a, b) => b.count - a.count);
  return (
    <RankedBarList
      data={sorted.map((d) => ({ name: d.label, value: d.count }))}
      color={colors.accent}
      format={(v) => `${v}`}
      showRank={false}
    />
  );
};

interface PeriodSummaryProps {
  employeeCount: number;
  totalHours: number;
  overtimeCount: number;
  totalOvertime: number;
}

export const PeriodSummary = ({ employeeCount, totalHours, overtimeCount, totalOvertime }: PeriodSummaryProps) => {
  const avgHours = employeeCount > 0 ? Math.round((totalHours / employeeCount) * 10) / 10 : 0;
  return (
    <StatGrid columns={5}>
      <StatCard label="Empleados" value={employeeCount} icon={<IconUsers />} tone="accent" />
      <StatCard label="Horas totales" value={`${totalHours} h`} icon={<IconClock />} />
      <StatCard label="Promedio por empleado" value={`${avgHours} h`} icon={<IconCalculator />} />
      <StatCard
        label="Horas extra"
        value={`${totalOvertime} h`}
        icon={<IconBolt />}
        tone={totalOvertime > 0 ? "warning" : "default"}
      />
      <StatCard
        label="Con horas extra"
        value={overtimeCount}
        icon={<IconUserExclamation />}
        tone={overtimeCount > 0 ? "warning" : "default"}
      />
    </StatGrid>
  );
};

interface OvertimeProps {
  data: { name: string; value: number }[];
}

export const OvertimeBarList = ({ data }: OvertimeProps) => {
  const { colors } = useTheme().tokens;
  if (!data.length) return <ChartEmpty>Ningún empleado con horas extra</ChartEmpty>;
  return <RankedBarList data={data.slice(0, 10)} color={colors.warning} format={(v) => `+${v} h`} />;
};
