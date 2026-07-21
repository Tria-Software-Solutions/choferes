import { useTheme, useMediaQuery, Box } from "@mui/material";
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

const SCHEDULE_COLORS = ["#4361EE", "#F72585", "#FF6B6B", "#20B2AA", "#FFB703", "#06D6A0", "#7209B7", "#00B4D8", "#A7C957", "#FF85A1"];

const COLORS = ["#F72585", "#4361EE", "#20B2AA", "#7209B7", "#FFB703", "#06D6A0", "#FF6B6B", "#00B4D8"];

interface TopEmployeesProps {
  data: { name: string; hours: number }[];
}

export const TopEmployeesChart = ({ data }: TopEmployeesProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data.length) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
        Sin datos de horas
      </Box>
    );
  }

  const limited = data.slice(0, 10);
  const maxVal = Math.max(...limited.map((d) => d.hours), 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.5, sm: 0.75 }, overflow: "auto", flex: 1, minHeight: 0, pr: 0.5 }}>
      {limited.map((item, i) => {
        const pct = Math.round((item.hours / maxVal) * 100);
        return (
          <Box key={item.name}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2, alignItems: "center" }}>
              <Box sx={{
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                fontWeight: 500,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: { xs: "55%", sm: "65%" },
              }}>
                {item.name}
              </Box>
              <Box sx={{
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                fontWeight: 700,
                color: "#4361EE",
                background: "rgba(67,97,238,0.1)",
                px: { xs: 0.5, sm: 0.75 },
                py: 0.15,
                borderRadius: "4px",
                whiteSpace: "nowrap",
              }}>
                {item.hours} hrs
              </Box>
            </Box>
            <Box sx={{ height: { xs: 3, sm: 6 }, borderRadius: "3px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: "3px", background: "linear-gradient(90deg, #6C83F5, #4361EE)", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
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
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
        Sin datos de vehículos
      </Box>
    );
  }

  const items = data.slice(0, 8);

  return (
    <Box sx={{
      flex: 1,
      display: "flex",
      flexDirection: { xs: "row", sm: "column", md: "row" },
      gap: { xs: 0.5, sm: 1, md: 1.5 },
      minHeight: 0,
      alignItems: "center",
    }}>
      {/* Pie chart */}
      <Box sx={{
        width: { xs: "45%", sm: "100%", md: "50%" },
        height: { xs: "100%", sm: "55%", md: "100%" },
        minHeight: { xs: 80, sm: 100, md: 120 },
        flexShrink: 0,
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="count"
              nameKey="brand"
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={36}
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
                fontSize: 11,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [`${value} vehículos`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      {/* Legend */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: { xs: "column", sm: "row", md: "column" },
        gap: { xs: 0.25, sm: 0.4, md: 0.5 },
        justifyContent: "center",
        flexWrap: "wrap",
        minHeight: 0,
      }}>
        {items.map((item, i) => (
          <Box key={item.brand} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <Box sx={{
              fontSize: { xs: "0.6rem", sm: "0.7rem" },
              fontWeight: 500,
              color: "text.primary",
              lineHeight: 1.2,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: { xs: 80, sm: 120 },
            }}>
              {item.brand}
            </Box>
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const daysOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const ordered = daysOrder.map((d) => data.find((x) => x.day === d) || { day: d, count: 0 });

  if (!data.length) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
        Sin datos de asistencia
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, width: "100%", height: "100%", minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ordered} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: isDark ? "#9ca3af" : "#6b7280" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#fff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: 8,
              fontSize: 11,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} empleados`, "Asistencia"]}
          />
          <Line type="monotone" dataKey="count" stroke="#4361EE" strokeWidth={2} dot={{ r: isSmallScreen ? 2 : 3, fill: "#4361EE" }} activeDot={{ r: isSmallScreen ? 3 : 5 }} />
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
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
        Sin datos de horarios
      </Box>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);
  const maxVal = Math.max(...sorted.map((d) => d.count), 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.5, sm: 1.25 }, overflow: "auto", flex: 1, minHeight: 0, pr: 0.5 }}>
      {sorted.map((item, i) => {
        const pct = Math.round((item.count / maxVal) * 100);
        const color = SCHEDULE_COLORS[i % SCHEDULE_COLORS.length];
        return (
          <Box key={item.label}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2, alignItems: "center" }}>
              <Box
                sx={{
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  fontWeight: 500,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: "55%", sm: "60%" },
                }}
              >
                {item.label}
              </Box>
              <Box sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, fontWeight: 700, color, px: { xs: 0.5, sm: 0.75 }, py: 0.15, borderRadius: "4px", background: `${color}1a` }}>
                {item.count}
              </Box>
            </Box>
            <Box sx={{ height: { xs: 4, sm: 8 }, borderRadius: "4px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
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
    { label: "Empleados", value: employeeCount, color: "#4361EE" },
    { label: "Horas totales", value: totalHours, color: "#F72585" },
    { label: "Promedio / emp.", value: avgHours, suffix: " hrs", color: "#20B2AA" },
    { label: "Con horas extra", value: overtimeCount, color: "#FF6B6B" },
  ];

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
      gap: { xs: 0.75, sm: 1, md: 1.5 },
      flex: 1,
      alignItems: "stretch",
    }}>
      {stats.map((s) => (
        <Box
          key={s.label}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "center",
            borderRadius: "12px",
            bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            p: { xs: 1.25, sm: 1.5 },
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            },
          }}
        >
          <Box sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            fontWeight: 800,
            color: s.color,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
          }}>
            {s.value}{s.suffix || ""}
          </Box>
          <Box sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            fontWeight: 500,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            lineHeight: 1.3,
            textAlign: { xs: "left", sm: "center" },
            wordBreak: "break-word",
          }}>
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
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", fontSize: { xs: "0.75rem", sm: "0.85rem" } }}>
        Sin datos de horas extra
      </Box>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const displayData = data.slice(0, 10);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.5, sm: 0.75 }, overflow: "auto", flex: 1, minHeight: 0 }}>
      {displayData.map((item, i) => (
        <Box key={i}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2, alignItems: "center" }}>
            <Box sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              fontWeight: 500,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: { xs: "55%", sm: "65%" },
            }}>
              {item.name}
            </Box>
            <Box sx={{
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              fontWeight: 700,
              color: "#F72585",
              background: "rgba(247,37,133,0.1)",
              px: { xs: 0.5, sm: 0.75 },
              py: 0.15,
              borderRadius: "4px",
              whiteSpace: "nowrap",
            }}>
              +{item.value}
            </Box>
          </Box>
          <Box sx={{ height: { xs: 3, sm: 6 }, borderRadius: "3px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${(item.value / maxVal) * 100}%`, borderRadius: "3px", background: "linear-gradient(90deg, #FF5EAA, #F72585)", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};
