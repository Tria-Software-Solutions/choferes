import { useTheme, Box } from "@mui/material";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
} from "recharts";

const SCHEDULE_COLORS = ["#7BA4D8", "#A78BDB", "#7EC8C3", "#B8A8D8", "#A8D8A8", "#E8A0B4", "#F0B8A0", "#8DA8E0", "#A0C8B8", "#D8A0C0"];

const COLORS = ["#A78BDB", "#7BA4D8", "#7EC8C3", "#8DA8E0", "#A8D8A8", "#E8A0B4", "#F0B8A0", "#B8A8D8"];

interface TopEmployeesProps {
  data: { name: string; hours: number }[];
}

export const TopEmployeesChart = ({ data }: TopEmployeesProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data.length) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: "0.85rem" }}>
        Sin datos de horas
      </Box>
    );
  }

  const limited = data.slice(0, 12);
  const maxVal = Math.max(...limited.map((d) => d.hours), 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, overflow: "auto", flex: 1, minHeight: 0, pr: 0.5 }}>
      {limited.map((item, i) => {
        const pct = Math.round((item.hours / maxVal) * 100);
        return (
          <Box key={item.name}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
              <Box sx={{ fontSize: "0.8rem", fontWeight: 500, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
                {item.name}
              </Box>
              <Box sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#A78BDB", background: "rgba(167,139,219,0.1)", px: 0.75, py: 0.15, borderRadius: "4px" }}>
                {item.hours} hrs
              </Box>
            </Box>
            <Box sx={{ height: 6, borderRadius: "3px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: "3px", background: "linear-gradient(90deg, #C4B0E8, #A78BDB)", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

interface VehicleBrandProps {
  data: { brand: string; count: number }[];
}

export const VehicleBrandChart = ({ data }: VehicleBrandProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data.length) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: "0.85rem" }}>
        Sin datos de vehículos
      </Box>
    );
  }

  const items = data.slice(0, 8);

  return (
    <Box sx={{ flex: 1, display: "flex", gap: 1.5, minHeight: 0 }}>
      <Box sx={{ width: "50%", height: "100%", minHeight: 0, flexShrink: 0, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="count"
              nameKey="brand"
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={48}
              paddingAngle={2}
              cornerRadius={4}
            >
              {items.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#fff",
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [`${value} vehículos`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5, justifyContent: "center", minHeight: 0, alignItems: "flex-end" }}>
        {items.map((item, i) => (
          <Box key={item.brand} sx={{ display: "flex", alignItems: "center", gap: 0.5, textAlign: "right" }}>
            <Box sx={{ fontSize: "0.7rem", fontWeight: 500, color: "text.primary", lineHeight: 1.3, wordBreak: "break-word" }}>
              {item.brand}
            </Box>
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const daysOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const ordered = daysOrder.map((d) => data.find((x) => x.day === d) || { day: d, count: 0 });

  if (!data.length) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: "0.85rem" }}>
        Sin datos de asistencia
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, width: "100%", height: "100%", minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ordered} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#fff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} empleados`, "Asistencia"]}
          />
          <Line type="monotone" dataKey="count" stroke="#7BA4D8" strokeWidth={2} dot={{ r: 3, fill: "#7BA4D8" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface ScheduleDistributionProps {
  data: { label: string; count: number }[];
}

export const ScheduleDistributionChart = ({ data }: ScheduleDistributionProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data.length) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: "0.85rem" }}>
        Sin datos de horarios
      </Box>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);
  const maxVal = Math.max(...sorted.map((d) => d.count), 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, overflow: "auto", flex: 1, minHeight: 0, pr: 0.5 }}>
      {sorted.map((item, i) => {
        const pct = Math.round((item.count / maxVal) * 100);
        const color = SCHEDULE_COLORS[i % SCHEDULE_COLORS.length];
        return (
          <Box key={item.label}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
              <Box
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "60%",
                }}
              >
                {item.label}
              </Box>
              <Box sx={{ fontSize: "0.75rem", fontWeight: 700, color, px: 0.75, py: 0.15, borderRadius: "4px", background: `${color}1a` }}>
                {item.count}
              </Box>
            </Box>
            <Box sx={{ height: 8, borderRadius: "4px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: "4px",
                  background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

interface PeriodSummaryProps {
  employeeCount: number;
  totalHours: number;
  overtimeCount: number;
  periodLabel: string;
}

export const PeriodSummary = ({ employeeCount, totalHours, overtimeCount, periodLabel }: PeriodSummaryProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const avgHours = employeeCount > 0 ? Math.round((totalHours / employeeCount) * 10) / 10 : 0;

  const stats = [
    { label: "Empleados", value: employeeCount, color: "#7BA4D8" },
    { label: "Horas totales", value: totalHours, color: "#A78BDB" },
    { label: "Promedio / empleado", value: avgHours, suffix: " hrs", color: "#7EC8C3" },
    { label: "Horas extra", value: overtimeCount, color: "#E8A0B4" },
  ];

  return (
    <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, flex: 1, alignItems: "center", flexWrap: "wrap" }}>
      {stats.map((s) => (
        <Box
          key={s.label}
          sx={{
            flex: { xs: "1 1 calc(50% - 8px)", sm: 1 },
            minWidth: { xs: 0, sm: 0 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 1.5,
            borderRadius: "12px",
            bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          <Box sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" }, fontWeight: 800, color: s.color, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            {s.value}{s.suffix || ""}
          </Box>
          <Box sx={{ fontSize: "0.7rem", fontWeight: 500, color: "text.secondary", textAlign: "center", mt: 0.25, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {s.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

interface OvertimeProps {
  data: { name: string; value: number }[];
}

export const OvertimeBarList = ({ data }: OvertimeProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data.length) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: "0.85rem" }}>
        Sin datos de horas extra
      </Box>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const displayData = data.slice(0, 10);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, overflow: "auto", flex: 1, minHeight: 0 }}>
      {displayData.map((item, i) => (
        <Box key={i}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
            <Box sx={{ fontSize: "0.8rem", fontWeight: 500, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
              {item.name}
            </Box>
            <Box sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#E8A0B4", background: "rgba(232,160,180,0.1)", px: 0.75, py: 0.15, borderRadius: "4px" }}>
              +{item.value}
            </Box>
          </Box>
          <Box sx={{ height: 6, borderRadius: "3px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${(item.value / maxVal) * 100}%`, borderRadius: "3px", background: "linear-gradient(90deg, #F0B8C8, #E8A0B4)", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};
