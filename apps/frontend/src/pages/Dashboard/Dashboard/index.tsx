import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
  Button,
  ButtonGroup,
} from "@mui/material";
import { getEmployees } from "../../../services/employeeService";
import { getMonthlySummaries } from "../../../services/monthlySummaryService";
import { getWeeklySummaries } from "../../../services/weeklySummaryService";
import { getBiweeklySummaries } from "../../../services/biweeklySummaryService";
import { getVehicles } from "../../../services/vehicleService";
import { getHoursWorked } from "../../../services/hoursWorkedService";
import { getSchedules } from "../../../services/scheduleService";
import { getWeekNumber, getBiweekNumber, getMonthNumber, getBiweeklyDates, getFirstDayOfWeek } from "../../../utils/dates";
import { LayoutDashboard } from "lucide-react";
import { PAGE_TITLE } from "../../../constants/constants";
import { BentoGrid, BentoGridItem } from "./components/BentoGrid";
import {
  TopEmployeesChart,
  VehicleBrandChart,
  DailyAttendanceChart,
  ScheduleDistributionChart,
  OvertimeBarList,
  PeriodSummary,
} from "./components/Charts";

interface EmployeeName {
  id: number;
  firstName: string;
  lastName: string;
}

interface OvertimeEmp {
  name: string;
  totalHours: number;
  overtime: number;
}

type Period = "weekly" | "biweekly" | "monthly";

interface RawEntry {
  employeeId: number;
  totalHours: number;
  year: number;
  month?: number;
  weekNumber?: number;
  biweekNumber?: number;
}

const THRESHOLDS: Record<Period, number> = {
  weekly: 48,
  biweekly: 96,
  monthly: 192,
};

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
};

const PERIOD_KEYS: Record<Period, keyof RawEntry> = {
  weekly: "weekNumber",
  biweekly: "biweekNumber",
  monthly: "month",
};

const getCurrentPeriodNum = (period: Period): number => {
  const today = new Date();
  if (period === "weekly") return getWeekNumber(today);
  if (period === "biweekly") return getBiweekNumber(today);
  return getMonthNumber(today);
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("biweekly");
  const [employeeMap, setEmployeeMap] = useState<Map<number, EmployeeName>>(new Map());
  const [weeklyRaw, setWeeklyRaw] = useState<RawEntry[]>([]);
  const [biweeklyRaw, setBiweeklyRaw] = useState<RawEntry[]>([]);
  const [monthlyRaw, setMonthlyRaw] = useState<RawEntry[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, unknown>[]>([]);
  const [hoursWorked, setHoursWorked] = useState<Record<string, unknown>[]>([]);
  const [schedules, setSchedules] = useState<Record<string, unknown>[]>([]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const results = await Promise.allSettled([
        getEmployees(),
        getWeeklySummaries(),
        getBiweeklySummaries(),
        getMonthlySummaries(),
        getVehicles(1, 10000),
        getHoursWorked(),
        getSchedules(),
      ]);

      if (cancelled) return;

      const empRes = results[0].status === "fulfilled" ? results[0].value : null;
      const wkRes = results[1].status === "fulfilled" ? results[1].value : null;
      const biRes = results[2].status === "fulfilled" ? results[2].value : null;
      const monRes = results[3].status === "fulfilled" ? results[3].value : null;
      const vehRes = results[4].status === "fulfilled" ? results[4].value : null;
      const hwRes = results[5].status === "fulfilled" ? results[5].value : null;
      const schRes = results[6].status === "fulfilled" ? results[6].value : null;

      const emap: Map<number, EmployeeName> = new Map();
      if (empRes) {
        const raw = Array.isArray(empRes) ? empRes : (empRes as { employees: unknown[] }).employees || [];
        for (const e of raw as Record<string, unknown>[]) {
          emap.set(e.id as number, { id: e.id as number, firstName: e.firstName as string, lastName: e.lastName as string });
        }
      }
      setEmployeeMap(emap);

      const extract = (res: unknown, key: string): RawEntry[] => {
        if (!res) return [];
        const raw = Array.isArray(res) ? res : (res as Record<string, unknown>)[key] || [];
        return (raw as Record<string, unknown>[]).map((r) => ({
          employeeId: r.employeeId as number,
          totalHours: (r.totalHours as number) || 0,
          year: (r.year as number) || 0,
          month: r.month as number | undefined,
          weekNumber: r.weekNumber as number | undefined,
          biweekNumber: r.biweekNumber as number | undefined,
        }));
      };

      setWeeklyRaw(extract(wkRes, "weeklySummaries"));
      setBiweeklyRaw(extract(biRes, "biweeklySummaries"));
      setMonthlyRaw(extract(monRes, "monthlySummaries"));

      if (vehRes) {
        const raw = Array.isArray(vehRes) ? vehRes : (vehRes as { vehicles: unknown[] }).vehicles || vehRes || [];
        setVehicles(raw as Record<string, unknown>[]);
      }
      if (hwRes) {
        const raw = Array.isArray(hwRes) ? hwRes : (hwRes as { hoursWorked: unknown[] }).hoursWorked || [];
        setHoursWorked(raw as Record<string, unknown>[]);
      }
      if (schRes) {
        const raw = Array.isArray(schRes) ? schRes : (schRes as { schedules: unknown[] }).schedules || [];
        setSchedules(raw as Record<string, unknown>[]);
      }

      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const currentYear = new Date().getFullYear();
  const currentPeriod = getCurrentPeriodNum(period);

  const filteredEmployeeIds = useMemo(() => {
    const raw: RawEntry[] =
      period === "weekly" ? weeklyRaw :
      period === "biweekly" ? biweeklyRaw :
      monthlyRaw;
    const periodKey = PERIOD_KEYS[period];
    return new Set(
      raw
        .filter((r) => r.year === currentYear && r[periodKey] === currentPeriod)
        .map((r) => r.employeeId)
    );
  }, [period, weeklyRaw, biweeklyRaw, monthlyRaw, currentYear, currentPeriod]);

  const periodDateRange = useMemo(() => {
    if (period === "weekly") {
      const monday = getFirstDayOfWeek(0);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { start: monday, end: sunday };
    }
    if (period === "biweekly") {
      const { startDate, endDate } = getBiweeklyDates(currentYear, currentPeriod);
      endDate.setHours(23, 59, 59, 999);
      return { start: startDate, end: endDate };
    }
    const start = new Date(currentYear, currentPeriod - 1, 1);
    const end = new Date(currentYear, currentPeriod, 0, 23, 59, 59, 999);
    return { start, end };
  }, [period, currentYear, currentPeriod]);

  const filtered = useMemo(() => {
    const raw: RawEntry[] =
      period === "weekly" ? weeklyRaw :
      period === "biweekly" ? biweeklyRaw :
      monthlyRaw;

    const periodKey = PERIOD_KEYS[period];
    const current = raw.filter((r) => r.year === currentYear && r[periodKey] === currentPeriod);

    // Deduplicate by employeeId: DB can have duplicate entries for the same
    // (employeeId, period, year) due to race conditions in RolesPage (prior to
    // migration 20260527000000 which added unique constraints).
    const deduped = Array.from(
      current.reduce((acc, r) => {
        if (!acc.has(r.employeeId)) acc.set(r.employeeId, r);
        return acc;
      }, new Map<number, RawEntry>()).values()
    );

    const threshold = THRESHOLDS[period];

    const byEmp: Record<number, number> = {};
    let totalHrs = 0;
    for (const r of deduped) {
      totalHrs += r.totalHours;
      byEmp[r.employeeId] = (byEmp[r.employeeId] || 0) + r.totalHours;
    }

    const top = Object.entries(byEmp)
      .map(([eid, hrs]) => {
        const emp = employeeMap.get(Number(eid));
        return { name: emp ? `${emp.firstName} ${emp.lastName}` : `Empleado #${eid}`, hours: Math.round(hrs * 10) / 10 };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 20);

    const overtimeByEmp: Record<number, { totalHours: number; overtime: number; name: string }> = {};
    for (const r of deduped) {
      if (r.totalHours > threshold) {
        const emp = employeeMap.get(r.employeeId);
        const name = emp ? `${emp.firstName} ${emp.lastName}`.trim() : `Empleado #${r.employeeId}`;
        const key = r.employeeId;
        if (!overtimeByEmp[key]) overtimeByEmp[key] = { totalHours: 0, overtime: 0, name };
        overtimeByEmp[key].totalHours += r.totalHours;
        overtimeByEmp[key].overtime += r.totalHours - threshold;
      }
    }
    const overtime: OvertimeEmp[] = Object.values(overtimeByEmp)
      .map((e) => ({ name: e.name, totalHours: Math.round(e.totalHours * 10) / 10, overtime: Math.round(e.overtime * 10) / 10 }))
      .sort((a, b) => b.overtime - a.overtime);

    return { top, overtime, totalHours: Math.round(totalHrs), employeeCount: employeeMap.size };
  }, [period, weeklyRaw, biweeklyRaw, monthlyRaw, employeeMap, currentYear, currentPeriod]);

  const scheduleDist = useMemo(() => {
    if (!hoursWorked.length || !schedules.length || !filteredEmployeeIds.size) return [];
    const { start, end } = periodDateRange;
    const schedMap = new Map(schedules.map((s) => [s.id as number, s.label as string]));
    const countBySched: Record<string, number> = {};
    for (const hw of hoursWorked) {
      if (!filteredEmployeeIds.has(hw.employeeId as number)) continue;
      const dateStr = hw.date as string;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      if (d < start || d > end) continue;
      const sid = hw.scheduleId as number;
      const label = schedMap.get(sid) || `Horario #${sid}`;
      countBySched[label] = (countBySched[label] || 0) + 1;
    }
    return Object.entries(countBySched)
      .filter(([label]) => label.toLowerCase() !== "horario especial")
      .map(([label, count]) => ({ label, count }));
  }, [hoursWorked, schedules, filteredEmployeeIds, periodDateRange]);

  const vehicleBrands = useMemo(() => {
    if (!vehicles.length) return [];
    const count: Record<string, number> = {};
    for (const v of vehicles) {
      const brand = (v.brand as string) || "Sin marca";
      count[brand] = (count[brand] || 0) + 1;
    }
    return Object.entries(count).map(([brand, count]) => ({ brand, count }));
  }, [vehicles]);

  const dailyAttendance = useMemo(() => {
    if (!hoursWorked.length || !filteredEmployeeIds.size) return [];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const byDate: Record<string, Set<number>> = {};
    for (const hw of hoursWorked) {
      if (!filteredEmployeeIds.has(hw.employeeId as number)) continue;
      const dateStr = hw.date as string;
      if (!dateStr) continue;
      const key = dateStr.split("T")[0];
      if (!byDate[key]) byDate[key] = new Set();
      byDate[key].add(hw.employeeId as number);
    }
    const dayCount: Record<string, number> = {};
    for (const [dateStr, emps] of Object.entries(byDate)) {
      const dayIdx = new Date(dateStr).getDay();
      const dayName = dayNames[dayIdx];
      dayCount[dayName] = (dayCount[dayName] || 0) + emps.size;
    }
    const dayOccurrences: Record<string, number> = {};
    for (const [dateStr] of Object.entries(byDate)) {
      const dayIdx = new Date(dateStr).getDay();
      const dayName = dayNames[dayIdx];
      dayOccurrences[dayName] = (dayOccurrences[dayName] || 0) + 1;
    }
    const result: { day: string; count: number }[] = [];
    for (const [dayName, total] of Object.entries(dayCount)) {
      const occurrences = dayOccurrences[dayName] || 1;
      result.push({ day: dayName, count: Math.round(total / occurrences) });
    }
    return result;
  }, [hoursWorked, filteredEmployeeIds]);

  if (loading) {
    return (
      <Box className="scrollable-content" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <CircularProgress size={28} />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="scrollable-content" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
      <Paper elevation={0} sx={{ borderRadius: { xs: "12px", sm: "16px" }, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", mx: { xs: 0.5, sm: 1.5, md: 2 }, mb: { xs: 1.5, sm: 3 }, mt: 0 }}>
        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2.5 }, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <Box display="flex" justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} flexDirection={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 1.5, md: 0 }} mb={{ xs: 1, sm: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5} flexShrink={0}>
              <Box sx={{ backgroundColor: theme.palette.primary.main, borderRadius: "10px", p: { xs: 0.75, sm: 1 }, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LayoutDashboard size={isSmallScreen ? 18 : 22} color={theme.palette.primary.contrastText} />
              </Box>
              <Box minWidth={0}>
                <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.25rem" }, color: theme.palette.text.primary, letterSpacing: "-0.02em", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {PAGE_TITLE.DASHBOARD}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: { xs: "0.65rem", sm: "0.75rem" }, letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                  {filtered.employeeCount} empleados · {filtered.totalHours} horas ({PERIOD_LABELS[period].toLowerCase()})
                </Typography>
              </Box>
            </Box>
            <ButtonGroup variant="outlined" size="small" sx={{
              gap: 0,
              alignSelf: { xs: "stretch", sm: "auto" },
              width: { xs: "100%", sm: "auto" },
              "& .MuiButtonGroup-grouped": {
                textTransform: "none", fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.8rem" }, px: { xs: 1, sm: 2 }, height: { xs: "32px", sm: "38px" },
                border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
                color: theme.palette.text.secondary, backgroundColor: "transparent",
                "&:hover": { backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)" },
                "&.MuiButton-contained": { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, borderColor: theme.palette.primary.main, "&:hover": { backgroundColor: theme.palette.primary.dark, borderColor: theme.palette.primary.dark } },
                "&:first-of-type": { borderTopLeftRadius: { xs: "8px", sm: "4px" }, borderBottomLeftRadius: { xs: "8px", sm: "4px" } },
                "&:last-of-type": { borderTopRightRadius: { xs: "8px", sm: "4px" }, borderBottomRightRadius: { xs: "8px", sm: "4px" } },
              },
            }}>
              <Button variant={period === "monthly" ? "contained" : "outlined"} onClick={() => setPeriod("monthly")} disableRipple disableElevation sx={{ flex: { xs: 1, sm: "none" } }}>Mensual</Button>
              <Button variant={period === "biweekly" ? "contained" : "outlined"} onClick={() => setPeriod("biweekly")} disableRipple disableElevation sx={{ flex: { xs: 1, sm: "none" } }}>Quincenal</Button>
              <Button variant={period === "weekly" ? "contained" : "outlined"} onClick={() => setPeriod("weekly")} disableRipple disableElevation sx={{ flex: { xs: 1, sm: "none" } }}>Semanal</Button>
            </ButtonGroup>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 1.5, sm: 3 }, display: "flex", flexDirection: "column" }}>
          <BentoGrid>
            <BentoGridItem
              title="Resumen del período"
              description={PERIOD_LABELS[period]}
              colSpan={{ lg: 4, md: 4 }}
              header={<PeriodSummary employeeCount={filtered.employeeCount} totalHours={filtered.totalHours} overtimeCount={filtered.overtime.length} periodLabel={PERIOD_LABELS[period]} />}
            />
            <BentoGridItem
              title="Horas por empleado"
              description="Top empleados con más horas trabajadas"
              colSpan={{ md: 2 }}
              rowSpan={{ md: 2 }}
              header={<TopEmployeesChart data={filtered.top} />}
            />
            <BentoGridItem
              title="Horas extra"
              description={`${filtered.overtime.length} empleados con horas extra`}
              header={<OvertimeBarList data={filtered.overtime.map((e) => ({ name: e.name, value: e.overtime }))} />}
            />
            <BentoGridItem
              title="Asistencia diaria"
              description="Promedio de empleados por día"
              header={<DailyAttendanceChart data={dailyAttendance} />}
            />
            <BentoGridItem
              title="Distribución por horario"
              description="Empleados agrupados por tipo de horario"
              header={<ScheduleDistributionChart data={scheduleDist} />}
            />
            <BentoGridItem
              title="Vehículos por marca"
              description="Distribución de vehículos por fabricante"
              header={<VehicleBrandChart data={vehicleBrands} />}
            />
          </BentoGrid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
