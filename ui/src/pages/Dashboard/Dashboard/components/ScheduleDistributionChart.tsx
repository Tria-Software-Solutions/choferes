import { Box, Typography, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

interface ScheduleDistributionChartProps {
  data: { label: string; count: number }[];
}

const ScheduleDistributionChart = ({ data }: ScheduleDistributionChartProps) => {
  const theme = useTheme();
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const isDark = theme.palette.mode === "dark";

  if (!sorted.length) {
    return (
      <Box sx={{ flex: "1 1 360px", minWidth: 0, p: 3, borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Distribución por horario</Typography>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled, textAlign: "center" }}>Sin datos</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: "1 1 360px", minWidth: 0, p: 3, borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Distribución por horario</Typography>
      <Box sx={{ height: 240, width: "100%" }}>
        <BarChart
          layout="horizontal"
          dataset={sorted}
          series={[
            {
              dataKey: "count",
              label: "Empleados",
              color: "#06b6d4",
              valueFormatter: (v) => `${v} empleados`,
            },
          ]}
          xAxis={[
            {
              scaleType: "linear",
              min: 0,
              valueFormatter: (v) => `${v}`,
            },
          ]}
          yAxis={[
            {
              scaleType: "band",
              dataKey: "label",
              tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
            },
          ]}
          legend={{ hidden: true }}
          sx={{
            [`.${axisClasses.left} .${axisClasses.tickLabel}`]: { fill: theme.palette.text.secondary, fontSize: 11 },
            [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: { fill: theme.palette.text.secondary, fontSize: 11 },
          }}
          margin={{ left: 160, right: 20, top: 8, bottom: 24 }}
        />
      </Box>
    </Box>
  );
};

export default ScheduleDistributionChart;
