import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IconCalendarMonth, IconInbox, IconRefresh } from "@tabler/icons-react";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { Employee } from "../../../models/Employee";
import { getBiweeklySummaries } from "../../../services/biweeklySummaryService";
import { recalculateSummaries } from "../../../services/hoursWorkedService";
import { useAuthContext } from "../../../context/AuthContext";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import OVERTIME from "../../../constants/overtime.constants";
import { neutralButtonStyles } from "../../../components/Table/EditableTable/helpers";
import PlaceholderSelect from "../../../components/PlaceholderSelect/PlaceholderSelect.component";
import { submitButton } from "../../Forms/sharedStyles";
import { getBiweeklyPeriodLabel } from "../../../utils/paymentSlipPdf";
import { getBiweeklyDates } from "../../../utils/dates";
import SectionHeader from "./SectionHeader";
import {
  cardStackStyles,
  fillSectionPaperStyles,
  emptyStateBoxStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
  tableCellStyles,
} from "../styles";

interface HoursTabProps {
  employee: Employee;
}

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// A single quincena as shown in the tab. `month` is NOT read from the stored
// summary (legacy rows carried an inconsistent month); it is derived from the
// biweek number, the single source of truth (1-15 / 16-end of month).
type HoursRow = {
  key: string;
  biweekNumber: number;
  year: number;
  month: number;
  totalHours: number;
};

// Biweek number -> first calendar day of that quincena, as a local YYYY-MM-DD
// (the format the recalculation endpoint expects).
const biweekStartDate = (biweekNumber: number, year: number): string => {
  const { startDate } = getBiweeklyDates(year, biweekNumber);
  const month = String(startDate.getMonth() + 1).padStart(2, "0");
  const day = String(startDate.getDate()).padStart(2, "0");
  return `${startDate.getFullYear()}-${month}-${day}`;
};

// Per-quincena hours of the employee (source of the biweekly pay calculation).
// The persisted summaries are a cache derived from the hours_worked records,
// so the tab reconciles them with the server before rendering (otherwise stale
// or duplicated rows made the totals disagree with the hours board).
const HoursTab: React.FC<HoursTabProps> = ({ employee }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();

  // The recalculate endpoint is guarded by `employee-hours:edit`, so gate the
  // actions on that same permission (not the biweekly-summary one).
  const canRecalculate = userPermissions.includes(PERMISSION_CODES.EDIT_EMPLOYEE_HOURS);

  const [summaries, setSummaries] = useState<BiweeklySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  // showNotification is not memoized in its provider — keep it in a ref so
  // the load callback stays stable and the fetch effect doesn't loop.
  const showNotificationRef = useRef(showNotification);
  showNotificationRef.current = showNotification;

  const fetchSummaries = useCallback(async () => {
    const data = await getBiweeklySummaries(employee.id);
    setSummaries(Array.isArray(data) ? data : []);
  }, [employee.id]);

  // Recompute the employee's summaries from the hours_worked records (source of
  // truth) and then read them back, so this tab always matches the hours board.
  const loadSummaries = useCallback(async () => {
    setIsLoading(true);
    try {
      if (canRecalculate) {
        try {
          await recalculateSummaries({ employeeId: employee.id });
        } catch {
          // Non-fatal: fall back to whatever is already stored.
        }
      }
      await fetchSummaries();
    } catch {
      setSummaries([]);
      showNotificationRef.current("No se pudieron cargar las horas", {
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [canRecalculate, employee.id, fetchSummaries]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  // Normalize the stored rows: drop entries that don't map to a real quincena
  // (out-of-range biweek numbers, zero/negative totals) and collapse duplicates
  // that the same (year, biweekNumber) may have accumulated.
  const rows = useMemo<HoursRow[]>(() => {
    const byKey = new Map<string, HoursRow>();
    summaries.forEach((summary) => {
      const biweekNumber = Number(summary.biweekNumber);
      const rowYear = Number(summary.year);
      const totalHours = Number(summary.totalHours);

      if (!Number.isInteger(biweekNumber) || biweekNumber < 1 || biweekNumber > 24) return;
      if (!Number.isFinite(rowYear)) return;
      if (!Number.isFinite(totalHours) || totalHours <= 0) return;

      const month = Math.floor((biweekNumber - 1) / 2) + 1;
      const key = `${rowYear}-${biweekNumber}`;
      const existing = byKey.get(key);
      if (!existing || totalHours > existing.totalHours) {
        byKey.set(key, { key, biweekNumber, year: rowYear, month, totalHours });
      }
    });
    return Array.from(byKey.values());
  }, [summaries]);

  const availableYears = useMemo(() => {
    const years = new Set<number>(rows.map((row) => row.year));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [rows, currentYear]);

  const filtered = useMemo(
    () =>
      rows
        .filter((row) => row.year === year)
        .sort((a, b) => b.biweekNumber - a.biweekNumber),
    [rows, year],
  );

  const totalHours = useMemo(
    () => filtered.reduce((total, row) => total + row.totalHours, 0),
    [filtered],
  );

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setBusyKey(null);
    try {
      await recalculateSummaries({ employeeId: employee.id });
      await fetchSummaries();
      showNotification("Resúmenes recalculados", { severity: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron recalcular los resúmenes";
      showNotification(message, { severity: "error" });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleRowRecalculate = async (row: HoursRow) => {
    setBusyKey(row.key);
    try {
      await recalculateSummaries({
        employeeId: employee.id,
        date: biweekStartDate(row.biweekNumber, row.year),
      });
      await fetchSummaries();
      showNotification(`Quincena Q${row.biweekNumber} recalculada`, {
        severity: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo recalcular la quincena";
      showNotification(message, { severity: "error" });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <Box sx={cardStackStyles}>
      <Paper elevation={0} sx={fillSectionPaperStyles(theme)}>
        <SectionHeader
          icon={<IconCalendarMonth size={20} stroke={1.5} />}
          title="Horas por quincena"
          description="Resumen de horas laboradas por quincena, base del cálculo quincenal."
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ minWidth: 120 }}>
                <PlaceholderSelect
                  placeholder="Año"
                  icon={<IconCalendarMonth size={20} color={theme.palette.text.secondary} />}
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                >
                  {availableYears.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </PlaceholderSelect>
              </Box>
              {canRecalculate && (
                <Button
                  variant="text"
                  startIcon={<IconRefresh size={18} />}
                  onClick={() => void handleRecalculate()}
                  disabled={isRecalculating}
                  fullWidth={isSmallScreen}
                  sx={submitButton}
                >
                  {isRecalculating ? "Recalculando..." : "Recalcular"}
                </Button>
              )}
            </Box>
          }
        />

        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
          {filtered.length} quincena{filtered.length === 1 ? "" : "s"} ·{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
            {totalHours.toFixed(2)} h
          </Box>{" "}
          en {year}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={emptyStateBoxStyles(theme)}>
            <IconInbox size={34} />
            <Typography variant="body2">
              No hay horas registradas para {year}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={tableContainerStyles(theme)}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyles}>Quincena</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Mes</TableCell>
                  <TableCell sx={tableHeaderCellStyles}>Periodo</TableCell>
                  <TableCell sx={tableHeaderCellStyles} align="right">
                    Total horas
                  </TableCell>
                  {canRecalculate && (
                    <TableCell sx={tableHeaderCellStyles} align="right">
                      Acciones
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row) => {
                  const overtime = row.totalHours - OVERTIME.BIWEEKLY;
                  const isBusy = busyKey === row.key;
                  return (
                    <TableRow
                      key={row.key}
                      hover
                    >
                      <TableCell sx={tableCellStyles}>
                        Q{row.biweekNumber} · {row.year}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        {monthNames[row.month - 1] || row.month}
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        {getBiweeklyPeriodLabel(row.biweekNumber, row.year)}
                      </TableCell>
                      <TableCell sx={tableCellStyles} align="right">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {row.totalHours.toFixed(2)} h
                          </Box>
                          {overtime > 0 && (
                            <Chip
                              size="small"
                              color="warning"
                              label={`+${overtime.toFixed(2)} h extra`}
                            />
                          )}
                        </Box>
                      </TableCell>
                      {canRecalculate && (
                        <TableCell sx={tableCellStyles} align="right">
                          <IconButton
                            size="small"
                            title="Recalcular quincena"
                            disabled={isBusy}
                            onClick={() => void handleRowRecalculate(row)}
                            sx={neutralButtonStyles(theme)}
                          >
                            <IconRefresh size={16} />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default HoursTab;
