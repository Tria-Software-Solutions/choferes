import { useState } from "react";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { ChevronDown } from "lucide-react";

interface TopEmployeesChartProps {
  data: { name: string; hours: number }[];
}

const INITIAL_LIMIT = 8;

const TopEmployeesChart = ({ data }: TopEmployeesChartProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const sorted = [...data].sort((a, b) => b.hours - a.hours);
  const displayData = expanded ? sorted : sorted.slice(0, INITIAL_LIMIT);
  const hasMore = sorted.length > INITIAL_LIMIT;
  const isDark = theme.palette.mode === "dark";

  if (!sorted.length) {
    return (
      <Box sx={{ flex: "1 1 100%", md: "1 1 calc(60% - 8px)", minWidth: 0, p: 3, borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Horas por empleado</Typography>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled, textAlign: "center" }}>Sin datos de horas por empleado</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: "1 1 100%", md: "1 1 calc(60% - 8px)", minWidth: 0, p: 3, borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>Horas por empleado</Typography>
      <Box sx={{ height: expanded ? 400 : 290, width: "100%", overflow: expanded ? "auto" : "hidden" }}>
        <BarChart
          layout="horizontal"
          dataset={displayData}
          series={[
            {
              dataKey: "hours",
              label: "Horas",
              color: "#8b5cf6",
              valueFormatter: (v) => `${v} hrs`,
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
              dataKey: "name",
              tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
            },
          ]}
          legend={{ hidden: true }}
          sx={{
            [`.${axisClasses.left} .${axisClasses.tickLabel}`]: { fill: theme.palette.text.secondary, fontSize: 11 },
            [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: { fill: theme.palette.text.secondary, fontSize: 11 },
          }}
          margin={{ left: 130, right: 20, top: 8, bottom: 24 }}
        />
      </Box>
      {hasMore && (
        <Button
          onClick={() => setExpanded(!expanded)}
          size="small"
          endIcon={<ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />}
          sx={{
            mt: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: theme.palette.primary.main,
            "&:hover": { background: "transparent", opacity: 0.8 },
          }}
        >
          {expanded ? "Ver menos" : `Ver más (${sorted.length - INITIAL_LIMIT})`}
        </Button>
      )}
    </Box>
  );
};

export default TopEmployeesChart;
