import { Box, Typography, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

interface DailyAttendanceChartProps {
  data: { day: string; count: number }[];
}

const DailyAttendanceChart = ({ data }: DailyAttendanceChartProps) => {
  const theme = useTheme();
  const daysOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const ordered = daysOrder.map((d) => data.find((x) => x.day === d) || { day: d, count: 0 });
  const isDark = theme.palette.mode === "dark";

  if (!data.length) {
    return (
      <Box sx={{ flex: "1 1 200px", minWidth: 0, p: 3, borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Asistencia diaria</Typography>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled, textAlign: "center" }}>Sin datos</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: "1 1 200px", minWidth: 0, p: 3, borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Asistencia diaria</Typography>
      <Box sx={{ height: 200, width: "100%" }}>
        <LineChart
          dataset={ordered}
          series={[
            {
              dataKey: "count",
              label: "Asistencia",
              color: "#3b82f6",
              valueFormatter: (v) => `${v} empleados`,
              showMark: true,
              area: true,
            },
          ]}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "day",
              tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
            },
          ]}
          yAxis={[
            {
              scaleType: "linear",
              min: 0,
              valueFormatter: (v) => `${v}`,
            },
          ]}
          legend={{ hidden: true }}
          sx={{
            [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: { fill: theme.palette.text.secondary, fontSize: 11 },
            [`.${axisClasses.left} .${axisClasses.tickLabel}`]: { fill: theme.palette.text.secondary, fontSize: 11 },
          }}
          margin={{ top: 8, right: 16, bottom: 28, left: 36 }}
        />
      </Box>
    </Box>
  );
};

export default DailyAttendanceChart;
