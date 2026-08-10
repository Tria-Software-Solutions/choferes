import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  type Theme,
} from "@mui/material";
import type { Employee } from "../../../models/Employee";
import type { Schedule } from "../../../models/Schedule";
import { capitalizeFirstLetter, translateDayToAbrevSpanish } from "../../../utils/string";
import EmployeeAvatar from "../../EmployeeAvatar/EmployeeAvatar.component";
import { formatHeaderDate } from "../../../utils/dates";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import { getScheduleHours } from "../../../utils/schedule";
import { SELECTOR_TABLE } from "../../../constants/constants";

interface QuickAssignPopoverProps {
  open: boolean;
  anchorPosition?: { top: number; left: number };
  onClose: () => void;
  view: "employee" | "schedule";
  day: string;
  date: string;
  schedules: Schedule[];
  employees: Employee[];
  assignedEmployeeIds?: number[];
  fixedScheduleLabel?: string;
  isDark: boolean;
  theme: Theme;
  onAssign: (employeeId: number, scheduleLabel: string) => void;
}

/**
 * Popover that appears when the user clicks on a day column (individual view)
 * or a day cell (schedule view) to quickly assign an employee + schedule
 * without dragging.
 *
 * - view === "employee": two lists — select multiple employees + pick a schedule
 * - view === "schedule": one list — select multiple employees (schedule is fixed by the cell)
 */
const QuickAssignPopover: React.FC<QuickAssignPopoverProps> = ({
  open, anchorPosition, onClose, view, day, date, schedules, employees,
  assignedEmployeeIds = [], fixedScheduleLabel, isDark, theme, onAssign,
}) => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState<string>("");

  const daySchedules = useMemo(
    () => schedules.filter((s) => s.days.includes(day.toLowerCase())),
    [schedules, day],
  );

  // Reset selection each time it opens (pre-check employees already in this column/cell)
  useEffect(() => {
    if (open) {
      setSelectedEmployeeIds(new Set(assignedEmployeeIds));
      setSelectedScheduleLabel("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const confirmDisabled =
    selectedEmployeeIds.size === 0 ||
    (view === "employee" && selectedScheduleLabel === "");

  const handleToggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedEmployeeIds.size === 0) return;
    const scheduleLabel =
      view === "schedule" ? fixedScheduleLabel ?? "" : selectedScheduleLabel;
    if (!scheduleLabel) return;

    // Assign to all selected employees and remove the ones that were unchecked
    const initiallyAssigned = new Set(assignedEmployeeIds);
    const affectedIds = new Set([...selectedEmployeeIds, ...initiallyAssigned]);
    affectedIds.forEach((empId) => {
      if (selectedEmployeeIds.has(empId)) {
        onAssign(empId, scheduleLabel);
      } else if (initiallyAssigned.has(empId)) {
        onAssign(empId, SELECTOR_TABLE.UNASSIGNED);
      }
    });
    onClose();
  };

  const renderEmployeeItem = (emp: Employee) => {
    const isSelected = selectedEmployeeIds.has(emp.id);
    return (
      <ListItemButton
        key={emp.id}
        onClick={() => handleToggleEmployee(emp.id)}
        selected={isSelected}
        sx={{
          mx: 0.5, borderRadius: "8px", my: 0.2, px: 1.25, py: 0.7,
          "&.Mui-selected": {
            backgroundColor: isDark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.08)",
          },
          "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
        }}
      >
        <EmployeeAvatar
          employee={emp}
          size={24}
          sx={{ flexShrink: 0, mr: 1, fontSize: "0.6rem" }}
        />
        <ListItemText
          primary={`${emp.firstName} ${emp.lastName?.[0]}.`}
          primaryTypographyProps={{
            fontSize: "0.78rem", fontWeight: isSelected ? 700 : 500,
          }}
        />
        {isSelected && (
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#818cf8" }}>✓</Typography>
        )}
      </ListItemButton>
    );
  };

  return (
    <Popover
      open={open}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            boxShadow: isDark ? "0 12px 44px rgba(0,0,0,0.45)" : "0 12px 44px rgba(0,0,0,0.14)",
            border: "none",
            width:
              view === "employee"
                ? { xs: 264, sm: 520, md: 560 }
                : { xs: 264, sm: 280, md: 300 },
            maxHeight: { xs: "80vh", sm: "80vh", md: 640 },
            overflow: "auto",
            mt: 0.5,
            p: 0.5,
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 1.25, py: 0.75, mb: 0.25,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      }}>
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.25 }}>
          {view === "employee" ? "Asignar en" : "Asignar a horario"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          {day ? (
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: theme.palette.text.primary }}>
              {capitalizeFirstLetter(translateDayToAbrevSpanish(day as EnglishDayOfWeek))} {formatHeaderDate(date)}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* Employee + schedule lists: side by side on sm+, stacked on mobile */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "flex-start",
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
          <Typography sx={{
            px: 1.25, pt: 0.75, pb: 0.25, fontSize: "0.6rem", fontWeight: 600,
            color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            Empleados ({selectedEmployeeIds.size} seleccionados)
          </Typography>
          <List
            dense
            sx={{
              py: 0,
              maxHeight:
                view === "employee"
                  ? { xs: "32vh", sm: 260, md: 320 }
                  : { xs: "50vh", sm: 300, md: 360 },
              overflow: "auto",
            }}
          >
            {employees.map(renderEmployeeItem)}
            {employees.length === 0 && (
              <Typography sx={{ px: 1.5, py: 1, fontSize: "0.7rem", color: "text.disabled" }}>
                No hay empleados disponibles
              </Typography>
            )}
          </List>
        </Box>

        {/* Schedule list — only in employee view */}
        {view === "employee" && (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: { xs: "100%", sm: "auto" },
              borderTop: { xs: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, sm: "none" },
              borderLeft: { xs: "none", sm: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` },
              mt: { xs: 0.25, sm: 0 },
              ml: { xs: 0, sm: 0.75 },
            }}
          >
            <Typography sx={{
              px: 1.25, pt: { xs: 0.5, sm: 0.75 }, pb: 0.25, fontSize: "0.6rem", fontWeight: 600,
              color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              Horario
            </Typography>
            <List dense sx={{ py: 0, maxHeight: { xs: "26vh", sm: 260, md: 320 }, overflow: "auto" }}>
              {daySchedules.map((s) => (
                <ListItemButton
                  key={s.id}
                  onClick={() => setSelectedScheduleLabel(s.label)}
                  selected={selectedScheduleLabel === s.label}
                  sx={{
                    mx: 0.5, borderRadius: "8px", my: 0.2, px: 1.25, py: 0.6,
                    "&.Mui-selected": {
                      backgroundColor: isDark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.08)",
                    },
                    "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                  }}
                >
                  <Box sx={{
                    width: 6, height: 6, borderRadius: "50%", mr: 1.25, flexShrink: 0,
                    backgroundColor: "#818cf8",
                  }} />
                  <ListItemText
                    primary={s.label}
                    primaryTypographyProps={{
                      fontSize: "0.78rem",
                      fontWeight: selectedScheduleLabel === s.label ? 700 : 500,
                    }}
                  />
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "#818cf8", ml: 1 }}>
                    {getScheduleHours(s, day)}h
                  </Typography>
                </ListItemButton>
              ))}
              {daySchedules.length === 0 && (
                <Typography sx={{ px: 1.5, py: 1, fontSize: "0.7rem", color: "text.disabled" }}>
                  {SELECTOR_TABLE.NO_AVAILABLE}
                </Typography>
              )}
            </List>
          </Box>
        )}
      </Box>

      {/* Actions — sticky so the buttons are always visible */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          zIndex: 2,
          display: "flex",
          gap: 0.75,
          p: 1,
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          borderRadius: "0 0 13px 13px",
        }}
      >
        <Box
          onClick={onClose}
          sx={{
            flex: 1, textAlign: "center", py: 0.7, borderRadius: "12px", cursor: "pointer",
            fontSize: "0.75rem", fontWeight: 600, color: "text.secondary",
            transition: "all 0.15s ease",
            "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },
          }}
        >
          Cancelar
        </Box>
        <Box
          onClick={handleConfirm}
          sx={{
            flex: 1, textAlign: "center", py: 0.7, borderRadius: "12px", cursor: "pointer",
            fontSize: "0.75rem", fontWeight: 700,
            backgroundColor: confirmDisabled
              ? (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
              : theme.palette.primary.main,
            color: confirmDisabled
              ? (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)")
              : theme.palette.primary.contrastText,
            transition: "all 0.15s ease",
            "&:hover": confirmDisabled
              ? {}
              : {
                  backgroundColor: isDark ? "#d4d4d4" : "#1a1a1a",
                  transform: "translateY(-1px)",
                },
          }}
        >
          Asignar {selectedEmployeeIds.size > 1 ? `(${selectedEmployeeIds.size})` : ""}
        </Box>
      </Box>
    </Popover>
  );
};

export default QuickAssignPopover;