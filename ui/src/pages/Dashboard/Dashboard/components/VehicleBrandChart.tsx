import { Box, Typography, useTheme } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

interface VehicleBrandChartProps {
  data: { brand: string; count: number }[];
}

const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4898"];

const VehicleBrandChart = ({ data }: VehicleBrandChartProps) => {
  const theme = useTheme();
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 8);

  if (!sorted.length) {
    return (
      <Box sx={{ flex: "1 1 260px", minWidth: 0, p: 3, borderRadius: "16px", background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Vehículos por marca</Typography>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled, textAlign: "center" }}>Sin datos</Typography>
        </Box>
      </Box>
    );
  }

  const pieData = sorted.map((d, i) => ({
    id: d.brand,
    value: d.count,
    label: d.brand,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <Box sx={{ flex: "1 1 260px", minWidth: 0, p: 3, borderRadius: "16px", background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Vehículos por marca</Typography>
      <Box sx={{ height: 200 }}>
        <PieChart
          series={[
            {
              data: pieData,
              innerRadius: 50,
              outerRadius: 90,
              paddingAngle: 2,
              cornerRadius: 4,
              faded: { innerRadius: 50, additionalRadius: -4, color: "gray" },
              valueFormatter: (v) => `${v.value} vehículos`,
            },
          ]}
          legend={{ hidden: true }}
          sx={{ "&&": { ".MuiChartsTooltip-root": { fontSize: "0.75rem" } } }}
        />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {pieData.map((item) => (
          <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.65rem", lineHeight: 1.2 }}>{item.id}: {item.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VehicleBrandChart;
