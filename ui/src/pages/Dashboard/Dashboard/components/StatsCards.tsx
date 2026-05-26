import { Box, Typography, useTheme } from "@mui/material";
import { Users, Clock, AlertTriangle, UserX, TrendingUp } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: string;
}

const StatCard = ({ icon, label, value, accent }: StatCardProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: { xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(33.33% - 11px)", md: "1 1 calc(20% - 13px)" },
        minWidth: 0,
        p: 2.5,
        borderRadius: "12px",
        background: accent || (theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.03)"
          : "rgba(0,0,0,0.02)"),
        border: theme.palette.mode === "dark"
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        backdropFilter: "blur(8px)",
      }}
    >
      <Box sx={{ color: theme.palette.primary.main, display: "flex", opacity: 0.7 }}>
        {icon}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1, fontSize: "1.5rem" }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.01em" }}>
        {label}
      </Typography>
    </Box>
  );
};

interface StatsCardsProps {
  employees: number;
  overtimeCount?: number;
  totalHours?: number;
  avgHours?: number;
  employeesWithoutHours?: number;
}

const StatsCards = ({ employees, overtimeCount = 0, totalHours = 0, avgHours = 0, employeesWithoutHours = 0 }: StatsCardsProps) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 0 }}>
      <StatCard icon={<Users size={20} strokeWidth={1.5} />} label="Empleados" value={employees} />
      <StatCard icon={<Clock size={20} strokeWidth={1.5} />} label="Total Horas" value={totalHours} />
      <StatCard icon={<AlertTriangle size={20} strokeWidth={1.5} />} label="Horas Extra" value={overtimeCount} accent="rgba(239,68,68,0.06)" />
      <StatCard icon={<UserX size={20} strokeWidth={1.5} />} label="Empleados sin horas" value={employeesWithoutHours} accent="rgba(251,191,36,0.06)" />
      <StatCard icon={<TrendingUp size={20} strokeWidth={1.5} />} label="Rendimiento Prom." value={avgHours} />
    </Box>
  );
};

export default StatsCards;
