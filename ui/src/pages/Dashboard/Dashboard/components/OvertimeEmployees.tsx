import { useState } from "react";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { ChevronDown } from "lucide-react";

interface OvertimeEmployee {
  name: string;
  period: string;
  totalHours: number;
  overtime: number;
}

interface OvertimeEmployeesProps {
  employees: OvertimeEmployee[];
  overtimeRate?: number;
}

const INITIAL_LIMIT = 8;

const OvertimeEmployees = ({ employees, overtimeRate = 0 }: OvertimeEmployeesProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const sorted = [...employees].sort((a, b) => b.overtime - a.overtime);
  const displayData = expanded ? sorted : sorted.slice(0, INITIAL_LIMIT);
  const hasMore = sorted.length > INITIAL_LIMIT;
  const maxOvertime = sorted.length ? Math.max(...sorted.map((e) => e.overtime)) : 1;

  return (
    <Box
      sx={{
        flex: { xs: "1 1 100%", md: "1 1 calc(40% - 8px)" },
        minWidth: 0,
        p: 3,
        borderRadius: "16px",
        background: theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.02)"
          : "rgba(255,255,255,0.6)",
        border: theme.palette.mode === "dark"
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: theme.palette.text.primary, letterSpacing: "-0.01em" }}>
        Horas extra{overtimeRate > 0 ? ` (${overtimeRate}%)` : ""}
      </Typography>
      {!sorted.length ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled, textAlign: "center" }}>
            Sin datos de horas extra
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: expanded ? 400 : 260, overflow: expanded ? "auto" : "hidden" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {displayData.map((emp, idx) => {
              const widthPct = (emp.overtime / maxOvertime) * 100;
              return (
                <Box key={`${emp.name}-${idx}`}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8rem", color: theme.palette.text.primary, maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {emp.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem", fontWeight: 500 }}>
                        {emp.totalHours}h
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          color: "#ef4444",
                          background: "rgba(239,68,68,0.1)",
                          px: 0.75,
                          py: 0.25,
                          borderRadius: "4px",
                          minWidth: 32,
                          textAlign: "center",
                        }}
                      >
                        +{emp.overtime}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${widthPct}%`,
                        borderRadius: 3,
                        background: "linear-gradient(90deg, #f87171, #ef4444)",
                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
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

export default OvertimeEmployees;
